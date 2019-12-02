// tslint:disable:unified-signatures
import { Inject, Injectable, Optional, Type } from '@angular/core';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';
import { INITIAL_STATE_TOKEN, PlainObject } from '@ngxs/store/internals';

import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';
import { InternalStateOperations } from './internal/state-operations';
import { getSelectorFn } from './utils/selector-utils';
import { StateStream } from './internal/state-stream';
import { leaveNgxs } from './operators/leave-ngxs';
import { NgxsConfig } from './symbols';
import { StateToken } from './state-token/state-token';

@Injectable()
export class Store {
  constructor(
    private _stateStream: StateStream,
    private _internalStateOperations: InternalStateOperations,
    private _config: NgxsConfig,
    private _internalExecutionStrategy: InternalNgxsExecutionStrategy,
    @Optional()
    @Inject(INITIAL_STATE_TOKEN)
    initialStateValue: any
  ) {
    this.initStateStream(initialStateValue);
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
  select<T = any>(selector: string | Type<any>): Observable<T>;
  select<T>(selector: StateToken<T>): Observable<T>;
  select(selector: any): Observable<any> {
    const selectorFn = getSelectorFn(selector);
    return this._stateStream.pipe(
      map(selectorFn),
      catchError((err: Error): Observable<never> | Observable<undefined> => {
        // if error is TypeError we swallow it to prevent usual errors with property access
        const { suppressErrors } = this._config.selectorOptions;

        if (err instanceof TypeError && suppressErrors) {
          return of(undefined);
        }

        // rethrow other errors
        return throwError(err);
      }),
      distinctUntilChanged(),
      leaveNgxs(this._internalExecutionStrategy)
    );
  }

  /**
   * Select one slice of data from the store.
   */

  selectOnce<T>(selector: (state: any, ...states: any[]) => T): Observable<T>;
  selectOnce<T = any>(selector: string | Type<any>): Observable<T>;
  selectOnce<T>(selector: StateToken<T>): Observable<T>;
  selectOnce(selector: any): Observable<any> {
    return this.select(selector).pipe(take(1));
  }

  /**
   * Select a snapshot from the state.
   */
  selectSnapshot<T>(selector: (state: any, ...states: any[]) => T): T;
  selectSnapshot<T = any>(selector: string | Type<any>): T;
  selectSnapshot<T>(selector: StateToken<T>): T;
  selectSnapshot(selector: any): any {
    const selectorFn = getSelectorFn(selector);
    return selectorFn(this._stateStream.getValue());
  }

  /**
   * Allow the user to subscribe to the root of the state
   */
  subscribe(fn?: (value: any) => void): Subscription {
    return this._stateStream.pipe(leaveNgxs(this._internalExecutionStrategy)).subscribe(fn);
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

  private initStateStream(initialStateValue: any): void {
    const value: PlainObject = this._stateStream.value;
    const storeIsEmpty: boolean = !value || Object.keys(value).length === 0;
    if (storeIsEmpty) {
      const defaultStateNotEmpty: boolean = Object.keys(this._config.defaultsState).length > 0;
      const storeValues: PlainObject = defaultStateNotEmpty
        ? { ...this._config.defaultsState, ...initialStateValue }
        : initialStateValue;

      this._stateStream.next(storeValues);
    }
  }
}
