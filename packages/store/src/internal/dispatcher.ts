import {
  DestroyRef,
  inject,
  Injectable,
  Injector,
  NgZone,
  runInInjectionContext
} from '@angular/core';
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

// RxJS reads operator config at construction time and never keeps the object,
// so these can be shared across every dispatch instead of rebuilt each call.
const DISPATCH_SHARE_REPLAY = { bufferSize: 1, refCount: true };

const ACTION_RESULT_SHARE = {
  // A fresh subject per dispatch, but the same factory each time.
  connector: () => new ReplaySubject<ɵPlainObject>(1),
  // A dispatch result happens once; keep replaying it and never re-run.
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
  private _injector = inject(Injector);
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

      // Note: a canceled action's stream completes without emitting, and
      // `forkJoin` completes without emitting if any source does. So if any
      // action in the batch is canceled, subscribers get `complete` but no
      // `next`, even if the other actions succeeded. This is documented on
      // `Store#dispatch`; kept as-is for consistency with single-action cancel.
      return forkJoin(actionOrActions.map(action => this.dispatchSingle(action))).pipe(
        map(() => undefined)
      );
    } else {
      return this.dispatchSingle(actionOrActions);
    }
  }

  // Emits the resulting state (not `void`); `dispatchByEvents` narrows it back
  // to `Observable<void>` for the public `dispatch()` contract.
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
      // Injector was already destroyed → no-op.
      return EMPTY;
    }

    const plugins = this._pluginManager.plugins;

    if (plugins.length === 0) {
      // Fast path for the common case of no registered plugins: `_runAction`
      // already returns a shared, replaying stream, so hand it back as-is.
      // Skips the `runPluginChain` closures and a second `shareReplay` layer
      // over the same value.
      //
      // We still keep the `runInInjectionContext` frame: `_runAction` runs the
      // synchronous part of the action handler (including any `.pipe(...)` it
      // builds) before it returns, and a handler may call `inject()` there. The
      // plugin path runs that same synchronous work inside an injection
      // context, so whether it's available must not depend on how many plugins
      // happen to be registered.
      return runInInjectionContext(this._injector, () => this._runAction(action));
    }

    const prevState = this._stateStream.getValue();

    const dispatched$ = runPluginChain(
      this._injector,
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

    // A plugin can wrap `_runAction`'s result in its own un-shared `.pipe(...)`,
    // so multicast the chain output for the eager subscriber and the caller.
    return dispatched$.pipe(shareReplay(DISPATCH_SHARE_REPLAY));
  }

  private _runAction(action: any): Observable<ɵPlainObject> {
    // Wait for this action's result on `_actionResults` and turn it into what
    // `dispatch()` should emit. Also push the result status back onto the main
    // action stream so `Actions` listeners (`ofActionSuccessful`, etc.) see it.
    const result$ = new Observable<ɵPlainObject>(subscriber =>
      this._actionResults.subscribe({
        next: ctx => {
          if (ctx.action !== action || ctx.status === ActionStatus.Dispatched) {
            return;
          }

          this._actions.next(ctx);

          switch (ctx.status) {
            case ActionStatus.Successful:
              // Emit the state, as plugins use it.
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
      // Share the single result with every subscriber (the eager one below, the
      // plugin chain, `forkJoin`, and the caller). See `ACTION_RESULT_SHARE`:
      // the reset flags are off so the result - a value or an error - keeps
      // replaying to late subscribers instead of re-running the source.
      share(ACTION_RESULT_SHARE)
    );

    // Subscribe now, before `Dispatched` is sent, so a synchronous handler's
    // result isn't missed. Consumers get any error from the shared result above;
    // this subscription just keeps the source alive, so ignore errors here.
    result$.subscribe(IGNORE_ERRORS);

    this._actions.next({ action, status: ActionStatus.Dispatched });

    return result$;
  }
}

/**
 * Runs the plugin functions as middleware around `handler`, left to right: each
 * plugin gets `(state, action, next)` and calls `next(state, action)` to pass
 * control on. Once the plugins are done, `handler(state, action)` runs.
 *
 * Everything runs inside one injection context so plugins can use `inject()`.
 */
function runPluginChain(
  injector: Injector,
  destroyRef: DestroyRef,
  plugins: NgxsPluginFn[],
  handler: NgxsNextPluginFn,
  state: any,
  action: any
): Observable<any> {
  const runFrom = (index: number, currentState: any, currentAction: any): any => {
    if (destroyRef.destroyed) {
      // The injector is gone (maybe a plugin destroyed it) — do nothing.
      return EMPTY;
    }

    if (index === plugins.length) {
      return handler(currentState, currentAction);
    }

    const next = (nextState: any, nextAction: any) =>
      runFrom(index + 1, nextState, nextAction);
    return plugins[index](currentState, currentAction, next);
  };

  return runInInjectionContext(injector, () => runFrom(0, state, action));
}
