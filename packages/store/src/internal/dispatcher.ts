import { DestroyRef, inject, Injectable, NgZone } from '@angular/core';
import { EMPTY, forkJoin, Observable, ReplaySubject, map, share, of } from 'rxjs';

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

// `share()` config for the dispatch streams below.
//
// `store.dispatch(new Foo())` gives you a stream. NGXS subscribes to it once to
// run the action; you might `.subscribe()` on it too, or never. With the reset
// flags off, whoever shows up late just gets the finished result (or the error)
// replayed - the action never runs twice.
//
// `shareReplay` won't do that: after an error it tosses its buffer and re-runs
// the source for the next subscriber. So it's plain `share()` plus our own
// `ReplaySubject`.
//
// One object, reused for every dispatch - RxJS copies these flags when it builds
// the operator and never looks at the object again.
const SHARE_WITH_NO_RESETS = {
  // Fresh subject per dispatch (each holds its own result), same factory fn.
  connector: () => new ReplaySubject<ɵPlainObject>(1),
  // Hang onto the result after error / complete / everyone leaving, so a late
  // subscriber gets handed it instead of restarting the whole thing.
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

      // Say you `dispatch([A, B])` and A gets canceled. A canceled action
      // completes without emitting, and `forkJoin` does the same if any of its
      // inputs do - so the caller gets `complete` but no value, even though B
      // was fine. It's documented on `Store#dispatch`, and it matches what a
      // single canceled dispatch does, so leave it be.
      return forkJoin(actionOrActions.map(action => this.dispatchSingle(action))).pipe(
        map(() => undefined)
      );
    } else {
      return this.dispatchSingle(actionOrActions);
    }
  }

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
      return EMPTY;
    }

    const plugins = this._pluginManager.plugins;

    if (plugins.length === 0) {
      return this._runAction(action);
    }

    const prevState = this._stateStream.getValue();

    const dispatched$ = runPluginChain(
      this._destroyRef,
      plugins,
      (state: any, action: any) => {
        // A plugin might've swapped the state out before the action runs - only
        // push it if it actually changed.
        if (state !== prevState) {
          this._stateStream.next(state);
        }
        return this._runAction(action);
      },
      prevState,
      action
    );

    // A plugin can wrap `_runAction`'s result in its own `.pipe(...)` that isn't
    // shared, so share the whole chain here. Two things subscribe to it:
    // `fallbackSubscriber` eagerly, then the real caller.
    //
    // The catch is it has to run exactly once. A plugin can call `next()`
    // lazily - say `gate$.pipe(mergeMap(() => next(state, action)))` - and then
    // `next()`, and the dispatch behind it, fires on every subscribe.
    // `fallbackSubscriber` drops to zero subscribers for a beat during the
    // handoff, so a `share` that resets would re-run the chain right there.
    // That's why every reset flag is off.
    return dispatched$.pipe(share(SHARE_WITH_NO_RESETS));
  }

  private _runAction(action: any): Observable<ɵPlainObject> {
    // Builds the stream `dispatch()` returns. Waits on `_actionResults` for this
    // action to land, then emits the new state (or errors). Also forwards each
    // status onto the main `Actions` stream so `ofActionSuccessful` & co. fire.
    const result$ = new Observable<ɵPlainObject>(subscriber =>
      this._actionResults.subscribe({
        next: ctx => {
          if (ctx.action !== action || ctx.status === ActionStatus.Dispatched) {
            return;
          }

          this._actions.next(ctx);

          switch (ctx.status) {
            case ActionStatus.Successful:
              // Emit the new state - downstream plugins read it.
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
      // The one result feeds a few subscribers - the keep-alive below, the
      // plugin chain, `forkJoin`, the caller - so share it.
      share(SHARE_WITH_NO_RESETS)
    );

    // Subscribe now, before we send `Dispatched`. `result$` is lazy - nothing
    // in it happens until someone subscribes - and a synchronous handler would
    // be done and gone before the caller ever got there. This sub is just a
    // keep-alive; real errors reach the caller through the shared `result$`, so
    // swallow them here.
    result$.subscribe(IGNORE_ERRORS);

    this._actions.next({ action, status: ActionStatus.Dispatched });

    return result$;
  }
}

/**
 * Runs the plugins as middleware around `handler`, left to right: each plugin
 * gets `(state, action, next)` and calls `next(state, action)` to pass control
 * along. After the last one, `handler(state, action)` runs.
 *
 * Nothing sets up an injection context here. Functional plugins that need
 * `inject()` get wrapped in one when they're registered (see `PluginManager`),
 * so with only class plugins - or none - the action handler runs without one.
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
      // Injector's gone (a plugin may have torn it down), so bail.
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
