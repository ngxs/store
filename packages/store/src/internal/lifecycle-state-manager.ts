import { Injectable, OnDestroy } from '@angular/core';
import { NgxsBootstrapper } from '@ngxs/store/internals';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  filter,
  mergeMap,
  pairwise,
  startWith,
  takeUntil,
  tap
} from 'rxjs/operators';

import { Store } from '../store';
import { getValue } from '../utils/utils';
import { InternalErrorReporter } from './error-handler';
import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { NgxsLifeCycle, NgxsSimpleChange, StateContext } from '../symbols';

@Injectable()
export class LifecycleStateManager implements OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private _store: Store,
    private _internalErrorReporter: InternalErrorReporter,
    private _internalStateOperations: InternalStateOperations,
    private _stateContextFactory: StateContextFactory,
    private _bootstrapper: NgxsBootstrapper
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngxsBootstrap<T>(action: T, results: StatesAndDefaults | undefined): void {
    this._internalStateOperations
      .getRootStateOperations()
      .dispatch(action)
      .pipe(
        filter(() => !!results),
        tap(() => this._invokeInitOnStates(results!.states)),
        mergeMap(() => this._bootstrapper.appBootstrapped$),
        filter(appBootstrapped => !!appBootstrapped),
        catchError(error => {
          // The `SafeSubscriber` (which is used by most RxJS operators) re-throws
          // errors asynchronously (`setTimeout(() => { throw error })`). This might
          // break existing user's code or unit tests. We catch the error manually to
          // be backward compatible with the old behavior.
          this._internalErrorReporter.reportErrorSafely(error);
          return EMPTY;
        }),
        takeUntil(this._destroy$)
      )
      .subscribe(() => this._invokeBootstrapOnStates(results!.states));
  }

  private _invokeInitOnStates(mappedStores: MappedStore[]): void {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;

      if (instance.ngxsOnChanges) {
        this._store
          .select(state => getValue(state, mappedStore.path))
          .pipe(startWith(undefined), pairwise(), takeUntil(this._destroy$))
          .subscribe(([previousValue, currentValue]) => {
            const change = new NgxsSimpleChange(
              previousValue,
              currentValue,
              !mappedStore.isInitialised
            );
            instance.ngxsOnChanges!(change);
          });
      }

      if (instance.ngxsOnInit) {
        instance.ngxsOnInit(this._getStateContext(mappedStore));
      }

      mappedStore.isInitialised = true;
    }
  }

  private _invokeBootstrapOnStates(mappedStores: MappedStore[]) {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;
      if (instance.ngxsAfterBootstrap) {
        instance.ngxsAfterBootstrap(this._getStateContext(mappedStore));
      }
    }
  }

  private _getStateContext(mappedStore: MappedStore): StateContext<any> {
    return this._stateContextFactory.createStateContext(mappedStore);
  }
}
