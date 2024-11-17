import { inject, Injectable, Injector, NgZone, runInInjectionContext } from '@angular/core';
import { EMPTY, forkJoin, Observable, of, Subject, throwError } from 'rxjs';
import { exhaustMap, filter, map, shareReplay, take } from 'rxjs/operators';

import { getActionTypeFromInstance } from '@ngxs/store/plugins';
import { ɵPlainObject, ɵStateStream } from '@ngxs/store/internals';

import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { PluginManager } from '../plugin-manager';
import { InternalNgxsExecutionStrategy } from '../execution/internal-ngxs-execution-strategy';
import { leaveNgxs } from '../operators/leave-ngxs';
import { fallbackSubscriber } from './fallback-subscriber';

/**
 * Internal Action result stream that is emitted when an action is completed.
 * This is used as a method of returning the action result to the dispatcher
 * for the observable returned by the dispatch(...) call.
 * The dispatcher then asynchronously pushes the result from this stream onto the main action stream as a result.
 */
@Injectable({ providedIn: 'root' })
export class InternalDispatchedActionResults extends Subject<ActionContext> {}

@Injectable({ providedIn: 'root' })
export class InternalDispatcher {
  private _ngZone = inject(NgZone);
  private _actions = inject(InternalActions);
  private _actionResults = inject(InternalDispatchedActionResults);
  private _pluginManager = inject(PluginManager);
  private _stateStream = inject(ɵStateStream);
  private _ngxsExecutionStrategy = inject(InternalNgxsExecutionStrategy);
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
    return actionResult$
      .pipe(
        exhaustMap((ctx: ActionContext) => {
          switch (ctx.status) {
            case ActionStatus.Successful:
              // The `createDispatchObservable` function should return the
              // state, as its result is utilized by plugins.
              return of(this._stateStream.getValue());
            case ActionStatus.Errored:
              return throwError(() => ctx.error);
            default:
              return EMPTY;
          }
        })
      )
      .pipe(shareReplay());
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
