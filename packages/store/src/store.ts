import { Injectable } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { distinctUntilChanged, catchError, take, map } from 'rxjs/operators';

import { StateStream } from './state-stream';
import { fastPropGetter } from './internals';
import { META_KEY } from './symbols';
import { InternalDispatcher } from './dispatcher';

@Injectable()
export class Store {
  constructor(private _stateStream: StateStream, private _dispatcher: InternalDispatcher) {}

  /**
   * Dispatches event(s).
   */
  dispatch(event: any | any[]): Observable<any> {
    return this._dispatcher.dispatch(event);
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
}
