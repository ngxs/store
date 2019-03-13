import { ErrorHandler, Injectable } from '@angular/core';
import { EMPTY, forkJoin, Observable, of, Subject, throwError } from 'rxjs';
import { exhaustMap, filter, shareReplay, take } from 'rxjs/operators';
import { ActionType } from '@ngxs/store';

import { compose } from '../utils/compose';
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { StateStream } from './state-stream';
import { PluginManager } from '../plugin-manager';
import { InternalNgxsExecutionStrategy } from '../execution/internal-ngxs-execution-strategy';
import { leaveNgxs } from '../operators/leave-ngxs';

/**
 * Internal Action result stream that is emitted when an action is completed.
 * This is used as a method of returning the action result to the dispatcher
 * for the observable returned by the dispatch(...) call.
 * The dispatcher then asynchronously pushes the result from this stream onto the main action stream as a result.
 */
@Injectable()
export class InternalDispatchedActionResults extends Subject<ActionContext> {}

@Injectable()
export class InternalDispatcher {
  constructor(
    private _errorHandler: ErrorHandler,
    private _actions: InternalActions,
    private _actionResults: InternalDispatchedActionResults,
    private _pluginManager: PluginManager,
    private _stateStream: StateStream,
    private _ngxsExecutionStrategy: InternalNgxsExecutionStrategy
  ) {}

  /**
   * Dispatches event(s).
   */
  dispatch<T = any>(actions: ActionType | ActionType[]): Observable<T> {
    const result = this._ngxsExecutionStrategy.enter(() => this.dispatchByEvents<T>(actions));

    result.subscribe({
      error: error =>
        this._ngxsExecutionStrategy.leave(() => this._errorHandler.handleError(error))
    });

    return result.pipe(leaveNgxs(this._ngxsExecutionStrategy));
  }

  private dispatchByEvents<T = any>(actions: ActionType | ActionType[]): Observable<any> {
    if (Array.isArray(actions)) {
      return forkJoin(actions.map(action => this.dispatchSingle<T>(action)));
    } else {
      return this.dispatchSingle<T>(actions);
    }
  }

  private dispatchSingle<T = any>(action: ActionType): Observable<T> {
    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return (compose([
      ...plugins,
      (nextState: any, nextAction: any) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }
        const actionResult$ = this.getActionResultStream(nextAction);
        actionResult$.subscribe(ctx => this._actions.next(ctx));
        this._actions.next({ action: nextAction, status: ActionStatus.Dispatched });
        return this.createDispatchObservable<T>(actionResult$);
      }
    ])(prevState, action) as Observable<T>).pipe(shareReplay());
  }

  private getActionResultStream(action: ActionType): Observable<ActionContext> {
    return this._actionResults.pipe(
      filter(
        (ctx: ActionContext) => ctx.action === action && ctx.status !== ActionStatus.Dispatched
      ),
      take(1),
      shareReplay()
    );
  }

  private createDispatchObservable<T = any>(
    actionResult$: Observable<ActionContext>
  ): Observable<T> {
    return actionResult$
      .pipe(
        exhaustMap((ctx: ActionContext) => {
          switch (ctx.status) {
            case ActionStatus.Successful:
              return of(this._stateStream.getValue());
            case ActionStatus.Errored:
              return throwError(ctx.error);
            default:
              return EMPTY;
          }
        })
      )
      .pipe(shareReplay());
  }
}
