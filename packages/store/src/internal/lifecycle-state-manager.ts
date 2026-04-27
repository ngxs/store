import { DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ɵNGXS_APP_BOOTSTRAP_STATE } from '@ngxs/store/internals';
import { getValue, InitState, UpdateState } from '@ngxs/store/plugins';

import { Store } from '../store';
import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { NgxsLifeCycle, NgxsSimpleChange, StateContext } from '../symbols';
import { getInvalidInitializationOrderMessage } from '../configs/messages.config';

@Injectable({ providedIn: 'root' })
export class LifecycleStateManager {
  private _destroyRef = inject(DestroyRef);
  private _injector = inject(Injector);
  private _store = inject(Store);
  private _internalStateOperations = inject(InternalStateOperations);
  private _stateContextFactory = inject(StateContextFactory);
  private _appBootstrapState = inject(ɵNGXS_APP_BOOTSTRAP_STATE);
  private _abortController = new AbortController();

  private _initStateHasBeenDispatched?: boolean;

  constructor() {
    inject(DestroyRef).onDestroy(() => this._abortController.abort());
  }

  ngxsBootstrap(
    action: InitState | UpdateState,
    results: StatesAndDefaults | undefined
  ): void {
    this._stateContextFactory.setErrorHandler();

    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
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

    // It does not need to unsubscribe because it is completed when the
    // root injector is destroyed.
    const rootStateOperations = this._internalStateOperations.getRootStateOperations();

    rootStateOperations.dispatch(action).subscribe(() => {
      // If no states are provided, we safely complete the stream
      // and do not proceed further.
      if (!results) {
        return;
      }

      this._invokeInitOnStates(results.states);

      const options = { injector: this._injector };
      toObservable(this._appBootstrapState, options)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(appBootstrapped => {
          if (!appBootstrapped) return;
          this._invokeBootstrapOnStates(results.states);
        });
    });
  }

  private _invokeInitOnStates(mappedStores: MappedStore[]): void {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;

      if (instance.ngxsOnChanges) {
        // We are manually keeping track of the previous value
        // within the subscribe block in order to drop the `pairwise()` operator.
        let previousValue: any;
        // It does not need to unsubscribe because it is completed when the
        // root injector is destroyed.
        this._store
          .select(state => getValue(state, mappedStore.path))
          .subscribe(currentValue => {
            const change = new NgxsSimpleChange(
              previousValue,
              currentValue,
              !mappedStore.isInitialised
            );
            previousValue = currentValue;
            instance.ngxsOnChanges!(change);
          });
      }

      instance.ngxsOnInit?.(this._getStateContext(mappedStore));

      mappedStore.isInitialised = true;
    }
  }

  private _invokeBootstrapOnStates(mappedStores: MappedStore[]) {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;
      instance.ngxsAfterBootstrap?.(this._getStateContext(mappedStore));
    }
  }

  private _getStateContext(mappedStore: MappedStore): StateContext<any> {
    return this._stateContextFactory.createStateContext(
      mappedStore.path,
      this._abortController.signal
    );
  }
}
