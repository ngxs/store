import { Injectable, ErrorHandler } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, shareReplay, map, tap } from 'rxjs/operators';

import { compose } from './compose';
import { InternalActions, ActionStatus } from './actions-stream';
import { StateFactory } from './state-factory';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';

@Injectable()
export class InternalDispatcher {
  constructor(
    private _errorHandler: ErrorHandler,
    private _actions: InternalActions,
    private _storeFactory: StateFactory,
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

    return (compose([
      ...plugins,
      (nextState, nextAction) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }

        this._actions.next({ action, status: ActionStatus.Dispatched });

        return this._storeFactory
          .invokeActions(
            () => this._stateStream.getValue(),
            newState => this._stateStream.next(newState),
            actions => this.dispatch(actions),
            this._actions,
            action
          )
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
      }
    ])(prevState, action) as Observable<any>).pipe(shareReplay());
  }
}
