import { Injectable, OnDestroy } from '@angular/core';
import { ɵNgxsAppBootstrappedState } from '@ngxs/store/internals';
import { getValue, InitState, UpdateState } from '@ngxs/store/plugins';
import { ReplaySubject } from 'rxjs';
import { filter, mergeMap, pairwise, startWith, takeUntil, tap } from 'rxjs/operators';

import { Store } from '../store';
import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { NgxsLifeCycle, NgxsSimpleChange, StateContext } from '../symbols';
import { getInvalidInitializationOrderMessage } from '../configs/messages.config';

const NG_DEV_MODE = typeof ngDevMode !== 'undefined' && ngDevMode;

@Injectable({ providedIn: 'root' })
export class LifecycleStateManager implements OnDestroy {
  private readonly _destroy$ = new ReplaySubject<void>(1);

  private _initStateHasBeenDispatched?: boolean;

  constructor(
    private _store: Store,
    private _internalStateOperations: InternalStateOperations,
    private _stateContextFactory: StateContextFactory,
    private _appBootstrappedState: ɵNgxsAppBootstrappedState
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
        mergeMap(() => this._appBootstrappedState),
        filter(appBootstrapped => !!appBootstrapped),
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
