import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  type Subscription,
  catchError,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  take,
  of
} from 'rxjs';
import { ɵINITIAL_STATE_TOKEN, ɵStateStream } from '@ngxs/store/internals';

import { InternalStateOperations } from './internal/state-operations';
import { getRootSelectorFactory } from './selectors/selector-utils';
import { leaveNgxs } from './operators/leave-ngxs';
import { NgxsConfig } from './symbols';
import { StateFactory } from './internal/state-factory';
import { TypedSelector } from './selectors';
import { InternalNgxsExecutionStrategy } from './execution/execution-strategy';

// We need to check whether the provided `T` type extends an array in order to
// apply the `NonNullable[]` type to its elements. This is because, for
// `const actions = [undefined]`, type inference would result in `NonNullable<unknown>`
// rather than `NonNullable<unknown>[]`.
type ActionOrArrayOfActions<T> = T extends (infer U)[] ? NonNullable<U>[] : NonNullable<T>;

@Injectable({ providedIn: 'root' })
export class Store {
  private _stateStream = inject(ɵStateStream);
  private _internalStateOperations = inject(InternalStateOperations);
  private _config = inject(NgxsConfig);
  private _internalExecutionStrategy = inject(InternalNgxsExecutionStrategy);
  private _stateFactory = inject(StateFactory);

  /**
   * This is a derived state stream that leaves NGXS execution strategy to emit state changes within the Angular zone,
   * because state is being changed actually within the `<root>` zone, see `InternalDispatcher#dispatchSingle`.
   * All selects would use this stream, and it would call leave only once for any state change across all active selectors.
   */
  private _selectableStateStream = this._stateStream.pipe(
    leaveNgxs(this._internalExecutionStrategy),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {
    this.initStateStream();
  }

  /**
   * Dispatches action(s).
   */
  dispatch<T>(actionOrActions: ActionOrArrayOfActions<T>): Observable<void> {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      if (
        // If a single action is dispatched and it's nullable.
        actionOrActions == null ||
        // If a list of actions is dispatched and any of the actions are nullable.
        (Array.isArray(actionOrActions) && actionOrActions.some(action => action == null))
      ) {
        const error = new Error('`dispatch()` was called without providing an action.');
        return new Observable(subscriber => subscriber.error(error));
      }
    }

    return this._internalStateOperations.getRootStateOperations().dispatch(actionOrActions);
  }

  /**
   * Selects a slice of data from the store.
   */
  select<T>(selector: TypedSelector<T>): Observable<T> {
    const selectorFn = this.getStoreBoundSelectorFn(selector);
    return this._selectableStateStream.pipe(
      map(selectorFn),
      catchError((error: Error): Observable<never> | Observable<undefined> => {
        // if error is TypeError we swallow it to prevent usual errors with property access
        if (this._config.selectorOptions.suppressErrors && error instanceof TypeError) {
          return of(undefined);
        }

        // rethrow other errors
        throw error;
      }),
      distinctUntilChanged(),
      leaveNgxs(this._internalExecutionStrategy)
    );
  }

  /**
   * Select one slice of data from the store.
   */
  selectOnce<T>(selector: TypedSelector<T>): Observable<T> {
    return this.select(selector).pipe(take(1));
  }

  /**
   * Select a snapshot from the state.
   */
  selectSnapshot<T>(selector: TypedSelector<T>): T {
    const selectorFn = this.getStoreBoundSelectorFn(selector);
    return selectorFn(this._stateStream.getValue());
  }

  /**
   * Select a signal from the state.
   */
  selectSignal<T>(selector: TypedSelector<T>): Signal<T> {
    const selectorFn = this.getStoreBoundSelectorFn(selector);
    return computed<T>(() => selectorFn(this._stateStream.state()));
  }

  /**
   * Allow the user to subscribe to the root of the state
   */
  subscribe(fn?: (value: any) => void): Subscription {
    return this._selectableStateStream
      .pipe(leaveNgxs(this._internalExecutionStrategy))
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
    this._internalStateOperations.getRootStateOperations().setState(state);
  }

  private getStoreBoundSelectorFn(selector: any) {
    const makeSelectorFn = getRootSelectorFactory(selector);
    const runtimeContext = this._stateFactory.getRuntimeSelectorContext();
    return makeSelectorFn(runtimeContext);
  }

  private initStateStream(): void {
    const initialStateValue: any = inject(ɵINITIAL_STATE_TOKEN);
    const value = this._stateStream.value;
    const storeIsEmpty = !value || Object.keys(value).length === 0;

    if (storeIsEmpty) {
      this._stateStream.next(initialStateValue);
    }
  }
}
