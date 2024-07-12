import { Inject, Injectable, Injector, Optional, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  asapScheduler,
  Observable,
  of,
  Subscription,
  throwError,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  take
} from 'rxjs';
import {
  ɵINITIAL_STATE_TOKEN,
  ɵPlainObject,
  ɵSelectFromRootState,
  ɵStateStream
} from '@ngxs/store/internals';

import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';
import { InternalStateOperations } from './internal/state-operations';
import { getRootSelectorFactory } from './selectors/selector-utils';
import { leaveNgxs } from './operators/leave-ngxs';
import { NgxsConfig } from './symbols';
import { StateFactory } from './internal/state-factory';
import { TypedSelector } from './selectors';

@Injectable({ providedIn: 'root' })
export class Store {
  /**
   * This is a derived state stream that leaves NGXS execution strategy to emit state changes within the Angular zone,
   * because state is being changed actually within the `<root>` zone, see `InternalDispatcher#dispatchSingle`.
   * All selects would use this stream, and it would call leave only once for any state change across all active selectors.
   */
  private _selectableStateStream = this._stateStream.pipe(
    leaveNgxs(this._internalExecutionStrategy),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private _injector = inject(Injector);

  constructor(
    private _stateStream: ɵStateStream,
    private _internalStateOperations: InternalStateOperations,
    private _config: NgxsConfig,
    private _internalExecutionStrategy: InternalNgxsExecutionStrategy,
    private _stateFactory: StateFactory,
    @Optional()
    @Inject(ɵINITIAL_STATE_TOKEN)
    initialStateValue: any
  ) {
    this.initStateStream(initialStateValue);
  }

  /**
   * Dispatches event(s).
   */
  dispatch(actionOrActions: any | any[]): Observable<void> {
    return this._internalStateOperations.getRootStateOperations().dispatch(actionOrActions);
  }

  /**
   * Selects a slice of data from the store.
   */
  select<T>(selector: TypedSelector<T>): Observable<T> {
    const selectorFn = this.getStoreBoundSelectorFn(selector);
    return this.selectFromStateStream(this._selectableStateStream, selectorFn);
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
    const initialValue = selectorFn(this._stateStream.value);
    const observable = this.selectFromStateStream(
      // https://github.com/ngxs/store/issues/2180
      // This is explicitly piped with the `debounceTime` to prevent synchronous
      // signal updates. Signal updates occurring within effects can lead to errors
      // stating that signal writes are not permitted in effects. This approach helps
      // decouple signal updates from synchronous changes, ensuring compliance with
      // constraints on updates inside effects.
      // Developers should never rely on manually reading the signal after the state
      // has been updated, whether synchronously or asynchronously, since the expected
      // result may not be immediately available. To retrieve the current slice of the
      // state, use `selectSnapshot` instead of directly accessing the signal. Signals
      // are intended for use in templates or effects, as they always guarantee
      // consistency with the latest signal value.
      this._selectableStateStream.pipe(debounceTime(0, asapScheduler)),
      selectorFn
    );

    return toSignal(observable, { initialValue, injector: this._injector });
  }

  private selectFromStateStream(
    observable: Observable<ɵPlainObject>,
    selectorFn: ɵSelectFromRootState
  ) {
    return observable.pipe(
      map(selectorFn),
      catchError((error: Error): Observable<never> | Observable<undefined> => {
        // if error is TypeError we swallow it to prevent usual errors with property access
        if (this._config.selectorOptions.suppressErrors && error instanceof TypeError) {
          return of(undefined);
        }

        // rethrow other errors
        return throwError(error);
      }),
      distinctUntilChanged(),
      leaveNgxs(this._internalExecutionStrategy)
    );
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

  private initStateStream(initialStateValue: any): void {
    const value = this._stateStream.value;
    const storeIsEmpty = !value || Object.keys(value).length === 0;

    if (storeIsEmpty) {
      this._stateStream.next(initialStateValue);
    }
  }
}
