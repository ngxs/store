// tslint:disable:unified-signatures
import { Injectable, Type, Optional, Inject } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';
import { INITIAL_STATE_TOKEN, ObjectKeyMap, ObjectUtils } from '@ngxs/store/internals';

import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';
import { InternalStateOperations } from './internal/state-operations';
import { getSelectorFn } from './utils/selector-utils';
import { StateStream } from './internal/state-stream';
import { leaveNgxs } from './operators/leave-ngxs';
import { NgxsConfig } from './symbols';

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
  select(selector: any): Observable<any> {
    const selectorFn = getSelectorFn(selector);
    return this._stateStream.pipe(
      map(selectorFn),
      catchError(err => {
        // if error is TypeError we swallow it to prevent usual errors with property access
        const suppressErrors: boolean | undefined = this._config.selectorOptions
          .suppressErrors;

        if (err instanceof TypeError && suppressErrors) {
          return of(undefined);
        }

        // rethrow other errors
        throw err;
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
  selectOnce(selector: any): Observable<any> {
    return this.select(selector).pipe(take(1));
  }

  /**
   * Select a snapshot from the state.
   */
  selectSnapshot<T>(selector: (state: any, ...states: any[]) => T): T;
  selectSnapshot<T = any>(selector: string | Type<any>): T;
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
    const value: ObjectKeyMap<any> = this._stateStream.value;
    const storeIsEmpty: boolean = !value || Object.keys(value).length === 0;
    if (storeIsEmpty) {
      this._stateStream.next(
        ObjectUtils.merge(
          ObjectUtils.clone(this._config.defaultsState),
          ObjectUtils.clone(initialStateValue)
        )
      );
    }
  }
}
