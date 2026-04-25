import {
  DestroyRef,
  inject,
  Injectable,
  Injector,
  NgZone,
  runInInjectionContext
} from '@angular/core';
import { EMPTY, forkJoin, Observable, map, mergeMap, shareReplay, of } from 'rxjs';

import { getActionTypeFromInstance } from '@ngxs/store/plugins';
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

    return compose(this._injector, this._destroyRef, [
      ...plugins,
      (nextState: any, nextAction: any) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }
        const actionResult$ = this.getActionResultStream(nextAction);
        actionResult$.subscribe(ctx => this._actions.next(ctx));
        this._actions.next({ action: nextAction, status: ActionStatus.Dispatched });
        return this.createDispatchObservable(actionResult$);
      }
    ])(prevState, action).pipe(shareReplay());
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
    }).pipe(shareReplay());
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
      shareReplay()
    );
  }
}

type StateFn = (...args: any[]) => Observable<void>;

/**
 * Composes a array of functions from left to right. Example:
 *
 *      compose([fn, final])(state, action);
 *
 * then the funcs have a signature like:
 *
 *      function fn (state, action, next) {
 *          console.log('here', state, action, next);
 *          return next(state, action);
 *      }
 *
 *      function final (state, action) {
 *          console.log('here', state, action);
 *          return state;
 *      }
 *
 * the last function should not call `next`.
 */
const compose =
  (injector: Injector, destroyRef: DestroyRef, fns: StateFn[]) =>
  (...args: any[]) => {
    const fn = fns.shift();

    if (destroyRef.destroyed || !fn) {
      // Injector was already destroyed → no-op
      return EMPTY;
    }

    return runInInjectionContext(injector, () =>
      fn(...args, (...nextArgs: any[]) => compose(injector, destroyRef, fns)(...nextArgs))
    );
  };
