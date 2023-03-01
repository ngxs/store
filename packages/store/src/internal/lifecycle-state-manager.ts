import { Injectable, OnDestroy } from '@angular/core';
import { NgxsBootstrapper } from '@ngxs/store/internals';
import { EMPTY, ReplaySubject } from 'rxjs';
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
import { InitState, UpdateState } from '../actions/actions';
import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { NgxsLifeCycle, NgxsSimpleChange, StateContext } from '../symbols';
import { getInvalidInitializationOrderMessage } from '../configs/messages.config';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

@Injectable({ providedIn: 'root' })
export class LifecycleStateManager implements OnDestroy {
  private readonly _destroy$ = new ReplaySubject<void>(1);

  private _initStateHasBeenDispatched?: boolean;

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

  ngxsBootstrap(
    action: InitState | UpdateState,
    results: StatesAndDefaults | undefined
  ): void {
    if (NG_DEV_MODE) {
      if (action instanceof InitState) {
        this._initStateHasBeenDispatched = true;
      } else if (
        // This is a dev mode-only check that ensures the correct order of
        // state initialization. The `NgxsModule.forRoot` or `provideStore` should
        // always come first, followed by `forFeature` and `provideStates`. If the
        // `UpdateState` is dispatched before the `InitState` is dispatched, it indicates
        // that modules or providers are in an invalid order.
        action instanceof UpdateState &&
        !this._initStateHasBeenDispatched
      ) {
        console.error(getInvalidInitializationOrderMessage(action.addedStates));
      }
    }

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
          this._internalErrorReporter.report(error);
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
