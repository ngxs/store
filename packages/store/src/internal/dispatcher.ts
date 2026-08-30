import {
  DestroyRef,
  inject,
  Injectable,
  Injector,
  NgZone,
  runInInjectionContext
} from '@angular/core';
import { EMPTY, forkJoin, Observable, map, mergeMap, shareReplay, of } from 'rxjs';

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
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { InternalNgxsExecutionStrategy } from '../execution/execution-strategy';

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

  private dispatchSingle(action: any): Observable<void> {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const type: string | undefined = getActionTypeFromInstance(action);
      if (!type) {
        const error = new Error(
          `This action doesn't have a type property: ${action.constructor.name}`
        );
        return new Observable(subscriber => subscriber.error(error));
      }
    }

    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    let dispatched$: Observable<any>;
    if (this._destroyRef.destroyed) {
      // Injector was already destroyed → no-op.
      dispatched$ = EMPTY;
    } else if (plugins.length === 0) {
      // Fast path for the common case of no registered plugins: invoke the
      // terminal handler directly and skip the `[...plugins, fn]` array, the
      // `runPluginChain` closures and the `runInInjectionContext` frame — none
      // of which do anything useful when there is no middleware to run.
      dispatched$ = this._dispatchAndCollectResult(action, prevState, prevState);
    } else {
      dispatched$ = runPluginChain(
        this._injector,
        this._destroyRef,
        plugins,
        (chainState: any, chainAction: any) =>
          this._dispatchAndCollectResult(chainAction, prevState, chainState),
        prevState,
        action
      );
    }

    return dispatched$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private _dispatchAndCollectResult(
    action: any,
    prevState: any,
    chainState: any
  ): Observable<ɵPlainObject> {
    // A plugin may have transformed the state before the action runs; push it
    // through only when it actually changed to avoid a redundant emission.
    if (chainState !== prevState) {
      this._stateStream.next(chainState);
    }
    const actionResult$ = this.getActionResultStream(action);
    actionResult$.subscribe(ctx => this._actions.next(ctx));
    this._actions.next({ action, status: ActionStatus.Dispatched });
    return this.createDispatchObservable(actionResult$);
  }

  private getActionResultStream(action: any): Observable<ActionContext> {
    // Hot path: avoid allocating `filter` + `take(1)` operator subscriber wrappers on every
    // dispatch. Instead, subscribe directly and complete inline — functionally identical but
    // without the intermediate operator chain objects.
    // `subscriber.complete()` triggers the outer subscription's teardown synchronously, which
    // calls `.unsubscribe()` on the inner `_actionResults` subscription (the returned
    // TeardownLogic), so there is no leak even though unsubscription fires mid-callback.
    return new Observable<ActionContext>(subscriber => {
      return this._actionResults.subscribe({
        next: ctx => {
          if (ctx.action === action && ctx.status !== ActionStatus.Dispatched) {
            subscriber.next(ctx);
            subscriber.complete();
          }
        },
        complete: () => !subscriber.closed && subscriber.complete()
      });
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private createDispatchObservable(
    actionResult$: Observable<ActionContext>
  ): Observable<ɵPlainObject> {
    return actionResult$.pipe(
      mergeMap((ctx: ActionContext) => {
        switch (ctx.status) {
          case ActionStatus.Successful:
            // The `createDispatchObservable` function should return the
            // state, as its result is used by plugins.
            return of(this._stateStream.getValue());
          case ActionStatus.Errored:
            throw ctx.error;
          default:
            // Once dispatched or canceled, we complete it immediately because
            // `dispatch()` should emit (or error, or complete) as soon as it succeeds or fails.
            return EMPTY;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}

/**
 * Runs the registered plugin functions left to right as middleware around the
 * terminal handler. Each plugin has the signature `(state, action, next)` and is
 * expected to call `next(state, action)` to hand off to the next plugin (or the
 * terminal handler once the plugins are exhausted).
 *
 * An index cursor walks `plugins` instead of mutating the array, so `next()` is
 * O(1). The whole synchronous chain runs inside a single `runInInjectionContext`
 * frame — every plugin resolves against the same injector anyway, so wrapping
 * each level separately only added overhead.
 */
function runPluginChain(
  injector: Injector,
  destroyRef: DestroyRef,
  plugins: NgxsPluginFn[],
  terminal: NgxsNextPluginFn,
  state: any,
  action: any
): Observable<any> {
  const invoke = (index: number, currentState: any, currentAction: any): any => {
    if (destroyRef.destroyed) {
      // Injector was destroyed (possibly by an earlier plugin) → no-op.
      return EMPTY;
    }

    if (index === plugins.length) {
      return terminal(currentState, currentAction);
    }

    return plugins[index](currentState, currentAction, (nextState: any, nextAction: any) =>
      invoke(index + 1, nextState, nextAction)
    );
  };

  return runInInjectionContext(injector, () => invoke(0, state, action));
}
