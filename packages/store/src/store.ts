import { Injectable, NgZone } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';

import { getSelectorFn } from './utils/selector-utils';
import { InternalStateOperations } from './internal/state-operations';
import { StateStream } from './internal/state-stream';
import { enterZone } from './operators/zone';

@Injectable()
export class Store {
  constructor(
    private _ngZone: NgZone,
    private _stateStream: StateStream,
    private _internalStateOperations: InternalStateOperations
  ) {}

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
  select(selector: string | any): Observable<any>;
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
      enterZone(this._ngZone)
    );
  }

  /**
   * Select one slice of data from the store.
   */
  selectOnce<T>(selector: (state: any, ...states: any[]) => T): Observable<T>;
  selectOnce(selector: string | any): Observable<any>;
  selectOnce(selector: any): Observable<any> {
    return this.select(selector).pipe(take(1));
  }

  /**
   * Select a snapshot from the state.
   */
  selectSnapshot<T>(selector: (state: any, ...states: any[]) => T): T;
  selectSnapshot(selector: string | any): any;
  selectSnapshot(selector: any): any {
    const selectorFn = getSelectorFn(selector);
    return selectorFn(this._stateStream.getValue());
  }

  /**
   * Allow the user to subscribe to the root of the state
   */
  subscribe(fn?: any): Subscription {
    return this._stateStream.pipe(enterZone(this._ngZone)).subscribe(fn);
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
