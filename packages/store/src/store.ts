// tslint:disable:unified-signatures
import { Injectable, NgZone, Type } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';

import { getSelectorFn } from './utils/selector-utils';
import { InternalStateOperations } from './internal/state-operations';
import { StateStream } from './internal/state-stream';
import { NgxsConfig } from './symbols';
import { enterZone } from './operators/zone';

@Injectable()
export class Store {
  constructor(
    private _ngZone: NgZone,
    private _stateStream: StateStream,
    private _internalStateOperations: InternalStateOperations,
    private config: NgxsConfig
  ) {
    this._stateStream.next(this.config.defaultsState);
  }

  /**
   * Dispatches event(s).
   */
  dispatch(event: any | any[]): Observable<any> {
    return this._internalStateOperations.getRootStateOperations().dispatch(event);
  }

  /**
   * Selects a slice of data from the store.
   */
  select<T>(selector: (state: any, ...states: any[]) => T): Observable<T>;
  select<T = any>(selector: string | Type<unknown>): Observable<T>;
  select(selector: any): Observable<any> {
    const selectorFn = getSelectorFn(selector);
    return this._stateStream.pipe(
      map(selectorFn),
      catchError(err => {
        // if error is TypeError we swallow it to prevent usual errors with property access
        if (err instanceof TypeError) {
          return of(undefined);
        }

        // rethrow other errors
        throw err;
      }),
      distinctUntilChanged(),
      enterZone(this.config.outsideZone, this._ngZone)
    );
  }

  /**
   * Select one slice of data from the store.
   */

  selectOnce<T>(selector: (state: any, ...states: any[]) => T): Observable<T>;
  selectOnce<T = any>(selector: string | Type<unknown>): Observable<T>;
  selectOnce(selector: any): Observable<any> {
    return this.select(selector).pipe(take(1));
  }

  /**
   * Select a snapshot from the state.
   */
  selectSnapshot<T>(selector: (state: any, ...states: any[]) => T): T;
  selectSnapshot<T = any>(selector: string | Type<unknown>): T;
  selectSnapshot(selector: any): any {
    const selectorFn = getSelectorFn(selector);
    return selectorFn(this._stateStream.getValue());
  }

  /**
   * Allow the user to subscribe to the root of the state
   */
  subscribe(fn?: (value: any) => void): Subscription {
    return this._stateStream
      .pipe(enterZone(this.config.outsideZone, this._ngZone))
      .subscribe(fn);
  }

  /**
   * Return the raw value of the state.
   */
  snapshot(): any {
    return this._internalStateOperations.getRootStateOperations().getState();
  }

  /**
   * Reset the state to a specific point in time. This method is useful
   * for plugin's who need to modify the state directly or unit testing.
   */
  reset(state: any) {
    return this._internalStateOperations.getRootStateOperations().setState(state);
  }
}
