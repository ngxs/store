import { Injectable, ErrorHandler } from '@angular/core';
import { Observable, Subscription, of, forkJoin } from 'rxjs';
import { distinctUntilChanged, catchError, take, shareReplay } from 'rxjs/operators';
import { map } from 'rxjs/operators';

import { compose } from './compose';
import { InternalActions } from './actions-stream';
import { StateFactory } from './state-factory';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { fastPropGetter } from './internals';
import { META_KEY } from './symbols';

@Injectable()
export class Store {
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
        throw err;
        // return of(err);
      })
    );

    result.subscribe();

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

    return this._stateStream.pipe(
      map(selector),
      catchError(err => {
        // if error is TypeError we swallow it to prevent usual errors with property access
        if (err instanceof TypeError) {
          return of(undefined);
        }

        // rethrow other errors
        throw err;
      }),
      distinctUntilChanged()
    );
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
   * Select a snapshot from the state.
   */
  selectSnapshot<T>(selector: (state: any) => T): T {
    return selector(this._stateStream.getValue());
  }

  /**
   * Allow the user to subscribe to the root of the state
   */
  subscribe(fn?: any): Subscription {
    return this._stateStream.subscribe(fn);
  }

  /**
   * Return the raw value of the state.
   */
  snapshot(): any {
    return this._stateStream.getValue();
  }

  private _dispatch(action): Observable<any> {
    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return (compose([
      ...plugins,
      (nextState, nextAction) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }

        this._actions.next(nextAction);

        return this._storeFactory
          .invokeActions(
            () => this._stateStream.getValue(),
            newState => this._stateStream.next(newState),
            actions => this.dispatch(actions),
            this._actions,
            action
          )
          .pipe(map(() => this._stateStream.getValue()));
      }
    ])(prevState, action) as Observable<any>).pipe(shareReplay());
  }
}
