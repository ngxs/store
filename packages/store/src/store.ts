// tslint:disable:unified-signatures
import { Injectable } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';

import { getSelectorFn } from './utils/selector-utils';
import { InternalStateOperations } from './internal/state-operations';
import { StateStream } from './internal/state-stream';
import { NgxsConfig } from './symbols';
import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';
import { leaveNgxs } from './operators/leave-ngxs';
import {
  ObjectKeyMap,
  SelectFromState,
  SelectorType,
  StateOperations
} from './internal/internals';
import { ActionType } from '../src/actions/symbols';

@Injectable()
export class Store {
  constructor(
    private _stateStream: StateStream,
    private _internalStateOperations: InternalStateOperations,
    private _config: NgxsConfig,
    private _internalExecutionStrategy: InternalNgxsExecutionStrategy
  ) {
    this.checkStoreIsEmpty();
  }

  private static handleError(err: Error): Observable<any> {
    if (err instanceof TypeError) {
      return of(undefined as any);
    }

    // rethrow other errors
    throw err;
  }

  /**
   * Dispatches event(s).
   * TODO: replace 'K = any' to only 'void' in v4.0.0
   */
  dispatch<T = any, K = any>(event: ActionType | ActionType[]): Observable<K | void> {
    return this.getRootStateOperations<T, K>().dispatch(event);
  }

  /**
   * Selects a slice of data from the store.
   */
  select<T = any, K = ObjectKeyMap<any>>(selector: SelectorType<T, K>): Observable<T> {
    const selectorFn: SelectFromState<T, K> = getSelectorFn<T, K>(selector);
    return this._stateStream.pipe(
      map<K, T>(selectorFn),
      catchError(err => Store.handleError(err)),
      distinctUntilChanged(),
      leaveNgxs(this._internalExecutionStrategy)
    );
  }

  /**
   * Select one slice of data from the store.
   */
  selectOnce<T = any, K = ObjectKeyMap<any>>(selector: SelectorType<T, K>): Observable<T> {
    return this.select(selector).pipe(take(1));
  }

  /**
   * Select a snapshot from the state.
   */
  selectSnapshot<T = any, K = ObjectKeyMap<any>>(selector: SelectorType<T, K>): T {
    const selectorFn: SelectFromState<T, K> = getSelectorFn<T, K>(selector);
    return selectorFn(this._stateStream.getValue()) as T;
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
  snapshot<T = any, K = any>(): T {
    return this.getRootStateOperations<T, K>().getState();
  }

  /**
   * Reset the state to a specific point in time. This method is useful
   * for plugin's who need to modify the state directly or unit testing.
   * TODO: replace 'K = any' to only 'void' in v4.0.0
   */
  reset<T = any, K = any>(state: T): T | void {
    return this.getRootStateOperations<T, K>().setState(state);
  }

  private getRootStateOperations<T = any, K = any>(): StateOperations<T, K> {
    return this._internalStateOperations.getRootStateOperations<T, K>();
  }

  private checkStoreIsEmpty(): void {
    const value: ObjectKeyMap<any> = this._stateStream.value;
    const storeIsEmpty: boolean = !value || Object.keys(value).length === 0;
    if (storeIsEmpty) {
      this._stateStream.next(this._config.defaultsState);
    }
  }
}
