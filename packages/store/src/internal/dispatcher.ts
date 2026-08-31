import { DestroyRef, inject, Injectable, NgZone } from '@angular/core';
import { EMPTY, forkJoin, Observable, ReplaySubject, map, share, shareReplay, of } from 'rxjs';

import {
  getActionTypeFromInstance,
  NgxsNextPluginFn,
  NgxsPluginFn
} from '@ngxs/store/plugins';
import { ɵPlainObject, ɵStateStream } from '@ngxs/store/internals';

import { PluginManager } from '../plugin-manager';
import { leaveNgxs } from '../operators/leave-ngxs';
import { fallbackSubscriber } from './fallback-subscriber';
import { InternalDispatchedActionResults } from './action-results';
import { ActionStatus, InternalActions } from '../actions-stream';
import { InternalNgxsExecutionStrategy } from '../execution/execution-strategy';

// RxJS copies these settings when it builds the operator and never looks at the
// object again, so every dispatch can share the same one instead of making a new one.
const DISPATCH_SHARE_REPLAY = { bufferSize: 1, refCount: true };

const ACTION_RESULT_SHARE = {
  // New subject per dispatch, same factory every time.
  connector: () => new ReplaySubject<ɵPlainObject>(1),
  // An action result happens once - keep replaying it, never re-run the source.
  resetOnError: false,
  resetOnComplete: false,
  resetOnRefCountZero: false
};

const IGNORE_ERRORS = { error: () => {} };

@Injectable({ providedIn: 'root' })
export class InternalDispatcher {
  private _ngZone = inject(NgZone);
  private _actions = inject(InternalActions);
  private _actionResults = inject(InternalDispatchedActionResults);
  private _pluginManager = inject(PluginManager);
  private _stateStream = inject(ɵStateStream);
  private _ngxsExecutionStrategy = inject(InternalNgxsExecutionStrategy);
  private _destroyRef = inject(DestroyRef);

  /**
   * Dispatches event(s).
   */
  dispatch(actionOrActions: any | any[]): Observable<void> {
    const result = this._ngxsExecutionStrategy.enter(() =>
      this.dispatchByEvents(actionOrActions)
    );

    return result.pipe(
      fallbackSubscriber(this._ngZone),
      leaveNgxs(this._ngxsExecutionStrategy)
    );
  }

  private dispatchByEvents(actionOrActions: any | any[]): Observable<void> {
    if (Array.isArray(actionOrActions)) {
      if (actionOrActions.length === 0) return of(undefined);

      // Heads up: a canceled action completes without emitting, and `forkJoin`
      // does the same if any of its inputs do. So cancel one action in a batch
      // and the caller gets `complete` with no `next`, even if the rest worked
      // fine. It's the documented behavior on `Store#dispatch` and matches a
      // single canceled dispatch, so we leave it alone.
      return forkJoin(actionOrActions.map(action => this.dispatchSingle(action))).pipe(
        map(() => undefined)
      );
    } else {
      return this.dispatchSingle(actionOrActions);
    }
  }

  // This one actually emits the new state, not `void` - `dispatchByEvents` maps
  // it back down to `void` for the public `dispatch()` signature.
  private dispatchSingle(action: any): Observable<any> {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const type: string | undefined = getActionTypeFromInstance(action);
      if (!type) {
        const error = new Error(
          `This action doesn't have a type property: ${action.constructor.name}`
        );
        return new Observable(subscriber => subscriber.error(error));
      }
    }

    if (this._destroyRef.destroyed) {
      // Injector's already destroyed, nothing to do.
      return EMPTY;
    }

    const plugins = this._pluginManager.plugins;

    if (plugins.length === 0) {
      // Most apps register no plugins, so go straight to `_runAction`. It
      // already gives back a shared, replaying stream, so there's nothing left
      // to wrap - no `runPluginChain` closures, no second `shareReplay`.
      //
      // Nothing sets up an injection context here, on purpose: `@Action`
      // handlers don't run in one (only plugin functions do - see
      // `PluginManager`), and with no plugins nothing needs one anyway.
      return this._runAction(action);
    }

    const prevState = this._stateStream.getValue();

    const dispatched$ = runPluginChain(
      this._destroyRef,
      plugins,
      (state: any, action: any) => {
        // A plugin may have replaced the state before the action runs; push
        // it through only when it actually changed.
        if (state !== prevState) {
          this._stateStream.next(state);
        }
        return this._runAction(action);
      },
      prevState,
      action
    );

    // A plugin might tack its own `.pipe(...)` onto `_runAction`'s result, and
    // that isn't shared, so `shareReplay` the chain here - the eager subscriber
    // and the caller both need to see the same single run.
    return dispatched$.pipe(shareReplay(DISPATCH_SHARE_REPLAY));
  }

  private _runAction(action: any): Observable<ɵPlainObject> {
    // Wait on `_actionResults` for this action to finish, then turn that into
    // what `dispatch()` emits. We also re-broadcast the result on the main
    // action stream so `Actions` listeners like `ofActionSuccessful` pick it up.
    const result$ = new Observable<ɵPlainObject>(subscriber =>
      this._actionResults.subscribe({
        next: ctx => {
          if (ctx.action !== action || ctx.status === ActionStatus.Dispatched) {
            return;
          }

          this._actions.next(ctx);

          switch (ctx.status) {
            case ActionStatus.Successful:
              // Hand back the current state - plugins read it.
              subscriber.next(this._stateStream.getValue());
              subscriber.complete();
              break;
            case ActionStatus.Errored:
              subscriber.error(ctx.error);
              break;
            default:
              // Canceled: complete without a value.
              subscriber.complete();
          }
        },
        complete: () => !subscriber.closed && subscriber.complete()
      })
    ).pipe(
      // One result, several subscribers (the keep-alive one below, the plugin
      // chain, `forkJoin`, the caller), so share it. `ACTION_RESULT_SHARE` turns
      // every reset flag off, so whatever came out - a value or an error - gets
      // replayed to anyone who subscribes late instead of running again.
      share(ACTION_RESULT_SHARE)
    );

    // Subscribe before firing `Dispatched` below: a synchronous handler can
    // finish right away and we'd miss the result otherwise. This subscription is
    // only here to keep the stream running - the caller gets errors from the
    // shared result above, so ignore them here.
    result$.subscribe(IGNORE_ERRORS);

    this._actions.next({ action, status: ActionStatus.Dispatched });

    return result$;
  }
}

/**
 * Runs the plugins as middleware around `handler`, left to right. Each plugin
 * gets `(state, action, next)` and calls `next(state, action)` to hand off to
 * the next one. After the last plugin, `handler(state, action)` runs.
 *
 * This function doesn't set up an injection context. Functional plugins that
 * need `inject()` get wrapped in one at registration time (see `PluginManager`),
 * so when every plugin is class-based (or there are none) the action handler
 * runs without one.
 */
function runPluginChain(
  destroyRef: DestroyRef,
  plugins: NgxsPluginFn[],
  handler: NgxsNextPluginFn,
  state: any,
  action: any
): Observable<any> {
  const runFrom = (index: number, currentState: any, currentAction: any): any => {
    if (destroyRef.destroyed) {
      // Injector's already gone (a plugin might have torn it down), so bail.
      return EMPTY;
    }

    if (index === plugins.length) {
      return handler(currentState, currentAction);
    }

    const next = (nextState: any, nextAction: any) =>
      runFrom(index + 1, nextState, nextAction);
    return plugins[index](currentState, currentAction, next);
  };

  return runFrom(0, state, action);
}
