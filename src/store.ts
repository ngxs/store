import { Injectable, ErrorHandler } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { distinctUntilChanged, catchError, take } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operators/map';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';

import { compose } from './compose';
import { Actions } from './actions-stream';
import { StateFactory } from './state-factory';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { fastPropGetter } from './internals';
import { META_KEY } from './symbols';

@Injectable()
export class Store {
  constructor(
    private _errorHandler: ErrorHandler,
    private _actions: Actions,
    private _storeFactory: StateFactory,
    private _stateStream: StateStream,
    private _pluginManager: PluginManager
  ) {}

  /**
   * Dispatches event(s).
   */
  dispatch(event: any | any[]): Observable<any> {
    let result;
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

    return result;
  }

  /**
   * Selects a slice of data from the store.
   */
  select<T>(selector: (state: any) => T): Observable<T>;
  select(selector: string | any): Observable<any>;
  select(selector: any): Observable<any> {
    if (selector[META_KEY] && selector[META_KEY].path) {
      const getter = fastPropGetter(selector[META_KEY].path.split('.'));
      return this._stateStream.pipe(map(getter), distinctUntilChanged());
    }

    return this._stateStream.pipe(map(selector), distinctUntilChanged());
  }

  /**
   * Select one slice of data from the store.
   */
  selectOnce<T>(selector: (state: any) => T): Observable<T>;
  selectOnce(selector: string | any): Observable<any>;
  selectOnce(selector: any): Observable<any> {
    return this.select(selector).pipe(take(1));
  }

  /**
   * Allow the user to subscribe to the root of the state
   */
  subscribe(fn?: any): Subscription {
    return this._stateStream.subscribe(fn);
  }

  private _dispatch(action): Observable<any> {
    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return compose([
      ...plugins,
      (nextState, nextAction) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }

        this._actions.next(nextAction);

        return this._dispatchActions(nextAction).pipe(map(() => this._stateStream.getValue()));
      }
    ])(prevState, action);
  }

  private _dispatchActions(action): Observable<any> {
    const results = this._storeFactory.invokeActions(
      () => this._stateStream.getValue(),
      newState => this._stateStream.next(newState),
      actions => this.dispatch(actions),
      action
    );

    return results.length ? forkJoin(this._handleNesting(results)) : of({}).pipe(take(1));
  }

  private _handleNesting(eventResults): Observable<any>[] {
    const results = [];
    for (let eventResult of eventResults) {
      if (eventResult instanceof Promise) {
        eventResult = fromPromise(eventResult);
      }

      if (eventResult instanceof Observable) {
        results.push(eventResult);
      }
    }
    return results;
  }
}
