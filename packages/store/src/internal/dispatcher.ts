import { inject, Injectable, Injector, NgZone, runInInjectionContext } from '@angular/core';
import {
  EMPTY,
  forkJoin,
  Observable,
  throwError,
  filter,
  map,
  mergeMap,
  shareReplay,
  take
} from 'rxjs';

import { getActionTypeFromInstance } from '@ngxs/store/plugins';
import { ɵPlainObject, ɵStateStream, ɵof } from '@ngxs/store/internals';

import { PluginManager } from '../plugin-manager';
import { leaveNgxs } from '../operators/leave-ngxs';
import { fallbackSubscriber } from './fallback-subscriber';
import { NGXS_EXECUTION_STRATEGY } from '../execution/symbols';
import { InternalDispatchedActionResults } from './action-results';
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';

@Injectable({ providedIn: 'root' })
export class InternalDispatcher {
  private _ngZone = inject(NgZone);
  private _actions = inject(InternalActions);
  private _actionResults = inject(InternalDispatchedActionResults);
  private _pluginManager = inject(PluginManager);
  private _stateStream = inject(ɵStateStream);
  private _ngxsExecutionStrategy = inject(NGXS_EXECUTION_STRATEGY);
  private _injector = inject(Injector);

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
      if (actionOrActions.length === 0) return ɵof(undefined);

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
        return throwError(() => error);
      }
    }

    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return compose(this._injector, [
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
    return this._actionResults.pipe(
      filter(
        (ctx: ActionContext) => ctx.action === action && ctx.status !== ActionStatus.Dispatched
      ),
      take(1),
      shareReplay()
    );
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
            return ɵof(this._stateStream.getValue());
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

type StateFn = (...args: any[]) => any;

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
  (injector: Injector, funcs: StateFn[]) =>
  (...args: any[]) => {
    const curr = funcs.shift()!;
    return runInInjectionContext(injector, () =>
      curr(...args, (...nextArgs: any[]) => compose(injector, funcs)(...nextArgs))
    );
  };
