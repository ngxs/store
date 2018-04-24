import { Injectable, ErrorHandler } from '@angular/core';
import { Observable, of, forkJoin, empty, Subject } from 'rxjs';
import { catchError, shareReplay, filter, exhaustMap, take, delay } from 'rxjs/operators';

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
      result = forkJoin(event.map(a => this._dispatch(a)));
    } else {
      result = this._dispatch(event);
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

  private _dispatch(action: any): Observable<any> {
    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return compose([
      ...plugins,
      (nextState, nextAction) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }

        const actionResult$ = this._actionResults.pipe(
          filter((ctx: ActionContext) => {
            return ctx.action === nextAction && ctx.status !== ActionStatus.Dispatched;
          }),
          take(1),
          shareReplay()
        );

        actionResult$
          .pipe(
            delay(0) // Force completion onto new task to prevent completion from firing before dispatch event on subsequent observers
          )
          .subscribe(ctx => {
            this._actions.next(ctx);
          });
        /*
        return this._stateFactory
          .invokeActions(this._actions, action)
          .pipe(
            tap(() => {
              this._actions.next({ action, status: ActionStatus.Completed });
            }),
            map(() => {
              return this._stateStream.getValue();
            }),
            catchError(err => {
              this._actions.next({ action, status: ActionStatus.Errored });

              return of(err);
            })
          );
          */

        this._actions.next({ action: nextAction, status: ActionStatus.Dispatched });

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
    ])(prevState, action) as Observable<any>;
  }
}
