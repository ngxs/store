import { Injectable, ErrorHandler } from '@angular/core';
import { Observable, of, forkJoin, empty } from 'rxjs';
import { catchError, shareReplay, filter, exhaustMap, take } from 'rxjs/operators';

import { compose } from './compose';
import { InternalActions, ActionStatus, ActionContext } from './actions-stream';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';

@Injectable()
export class InternalDispatcher {
  constructor(
    private _errorHandler: ErrorHandler,
    private _actions: InternalActions,
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

        const output = this._actions
          .pipe(
            filter((ctx: ActionContext) => ctx.action === action && ctx.status !== ActionStatus.Dispatched),
            take(1),
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
        output.subscribe();
        this._actions.next({ action: nextAction, status: ActionStatus.Dispatched });
        return output;
      }
    ])(prevState, action) as Observable<any>;
  }
}
