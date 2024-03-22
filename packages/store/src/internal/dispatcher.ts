import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, Observable, of, Subject, throwError } from 'rxjs';
import { exhaustMap, filter, map, shareReplay, take } from 'rxjs/operators';

import { getActionTypeFromInstance } from '@ngxs/store/plugins';
import { ɵPlainObject, ɵStateStream } from '@ngxs/store/internals';

import { compose } from '../utils/compose';
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { PluginManager } from '../plugin-manager';
import { InternalNgxsExecutionStrategy } from '../execution/internal-ngxs-execution-strategy';
import { leaveNgxs } from '../operators/leave-ngxs';

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
  constructor(
    private _actions: InternalActions,
    private _actionResults: InternalDispatchedActionResults,
    private _pluginManager: PluginManager,
    private _stateStream: ɵStateStream,
    private _ngxsExecutionStrategy: InternalNgxsExecutionStrategy
  ) {}

  /**
   * Dispatches event(s).
   */
  dispatch(actionOrActions: any | any[]): Observable<void> {
    const result = this._ngxsExecutionStrategy.enter(() =>
      this.dispatchByEvents(actionOrActions)
    );

    // We need to subscribe inside the framework because, in RxJS, computations
    // or side effects within an observable will only trigger when there's a subscription.
    // Until a subscription is made, the observable will not execute its logic.
    // This is important to note because if developers subscribe externally,
    // it won't trigger new computations, because the observable is "replayed".
    result.subscribe();

    return result.pipe(leaveNgxs(this._ngxsExecutionStrategy));
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
        return throwError(error);
      }
    }

    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return compose([
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
