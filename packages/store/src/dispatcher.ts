import { Injectable, ErrorHandler } from '@angular/core';
import { Observable, of, forkJoin, empty, Subject } from 'rxjs';
import { catchError, shareReplay, filter, exhaustMap, take } from 'rxjs/operators';

import { compose } from './compose';
import { InternalActions, ActionStatus, ActionContext } from './actions-stream';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';

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
    private _stateStream: StateStream
  ) {}

  /**
   * Dispatches event(s).
   */
  dispatch(event: any | any[]): Observable<any> {
    let result: Observable<any>;

    if (Array.isArray(event)) {
      result = forkJoin(event.map(a => this.dispatchSingle(a)));
    } else {
      result = this.dispatchSingle(event);
    }

    result.pipe(
      catchError(err => {
        // handle error through angular error system
        this._errorHandler.handleError(err);
        return of(err);
      })
    );

    result.subscribe();

    return result;
  }

  private dispatchSingle(action: any): Observable<any> {
    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return compose([
      ...plugins,
      (nextState, nextAction) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }
        const actionResult$ = this.getActionResultStream(action);
        actionResult$.subscribe(ctx => this._actions.next(ctx));
        this._actions.next({ action: action, status: ActionStatus.Dispatched });
        return this.createDispatchObservable(actionResult$);
      }
    ])(prevState, action) as Observable<any>;
  }

  private getActionResultStream(action: any): Observable<ActionContext> {
    const actionResult$ = this._actionResults.pipe(
      filter((ctx: ActionContext) => {
        return ctx.action === action && ctx.status !== ActionStatus.Dispatched;
      }),
      take(1),
      shareReplay()
    );
    return actionResult$;
  }

  private createDispatchObservable(actionResult$: Observable<ActionContext>): Observable<any> {
    return actionResult$
      .pipe(
        exhaustMap((ctx: ActionContext) => {
          switch (ctx.status) {
            case ActionStatus.Completed:
              return of(this._stateStream.getValue());
            case ActionStatus.Errored:
              return of(this._stateStream.getValue()); // This was previously the error value
            // I think that this should rather
            // return throwError(new Error('the error goes here'))
            default:
              return empty();
          }
        })
      )
      .pipe(shareReplay());
  }
}
