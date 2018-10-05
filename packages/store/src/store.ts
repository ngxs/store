import { Injectable, NgZone } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';

import { getSelectorFn } from './utils/selector-utils';
import { InternalStateOperations } from './internal/state-operations';
import { StateStream } from './internal/state-stream';
import { enterZone } from './operators/zone';
import { DispatchEmitter, DISPATCHER_META_KEY } from './symbols';
import { DispatchAction } from './actions/actions';

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
  dispatch<T = any, U = any>(event: T | T[]): Observable<U> {
    return this._internalStateOperations.getRootStateOperations().dispatch(event);
  }

  /**
   * Creates action dispatcher.
   */
  emitter<T = any, U = any>(dispatcher: Function): DispatchEmitter<T, U> {
    const dispatcherEvent = dispatcher[DISPATCHER_META_KEY];

    if (!dispatcherEvent) {
      throw new Error('Dispatcher methods should be decorated using @Dispatcher() decorator');
    }

    return {
      emit: (payload?: T): Observable<U> => {
        DispatchAction.type = dispatcherEvent.type;
        const action: DispatchAction<T> = new DispatchAction<T>(payload);
        return this._getRootStateOperations().dispatch<DispatchAction>(action);
      }
    };
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
    return this._getRootStateOperations().getState();
  }

  /**
   * Reset the state to a specific point in time. This method is useful
   * for plugin's who need to modify the state directly or unit testing.
   */
  reset(state: any) {
    return this._getRootStateOperations().setState(state);
  }

  private _getRootStateOperations() {
    return this._internalStateOperations.getRootStateOperations();
  }
}
