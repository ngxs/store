import { Injectable, ErrorHandler } from '@angular/core';
import { Observable, of, forkJoin, empty, Subject, throwError } from 'rxjs';
import { shareReplay, filter, exhaustMap, take } from 'rxjs/operators';

import { compose } from '../utils/compose';
import { InternalActions, ActionStatus, ActionContext } from '../actions-stream';
import { StateStream } from './state-stream';
import { PluginManager } from '../plugin-manager';
import { NgxsConfig } from '../symbols';
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
  dispatch(actionOrActions: any | any[]): Observable<any> {
    const result = this._ngxsExecutionStrategy.enter(() =>
      this.dispatchByEvents(actionOrActions)
    );

    result.subscribe({
      error: error =>
        this._ngxsExecutionStrategy.leave(() => this._errorHandler.handleError(error))
    });

    return result.pipe(leaveNgxs(this._ngxsExecutionStrategy));
  }

  private dispatchByEvents(actionOrActions: any | any[]): Observable<any> {
    if (Array.isArray(actionOrActions)) {
      return forkJoin(actionOrActions.map(a => this.dispatchSingle(a)));
    } else {
      return this.dispatchSingle(actionOrActions);
    }
  }

  private dispatchSingle(action: any): Observable<any> {
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
        return this.createDispatchObservable(actionResult$);
      }
    ])(prevState, action) as Observable<any>).pipe(shareReplay());
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

  private createDispatchObservable(actionResult$: Observable<ActionContext>): Observable<any> {
    return actionResult$
      .pipe(
        exhaustMap((ctx: ActionContext) => {
          switch (ctx.status) {
            case ActionStatus.Successful:
              return of(this._stateStream.getValue());
            case ActionStatus.Errored:
              return throwError(ctx.error);
            default:
              return empty();
          }
        })
      )
      .pipe(shareReplay());
  }
}
