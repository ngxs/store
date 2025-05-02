import { inject, Injectable } from '@angular/core';
import { ɵNgxsAppBootstrappedState } from '@ngxs/store/internals';
import { getValue, InitState, UpdateState } from '@ngxs/store/plugins';
import { EMPTY, mergeMap, skip, startWith } from 'rxjs';

import { Store } from '../store';
import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { NgxsLifeCycle, NgxsSimpleChange, StateContext } from '../symbols';
import { getInvalidInitializationOrderMessage } from '../configs/messages.config';

@Injectable({ providedIn: 'root' })
export class LifecycleStateManager {
  private _store = inject(Store);
  private _internalStateOperations = inject(InternalStateOperations);
  private _stateContextFactory = inject(StateContextFactory);
  private _appBootstrappedState = inject(ɵNgxsAppBootstrappedState);

  private _initStateHasBeenDispatched?: boolean;

  ngxsBootstrap(
    action: InitState | UpdateState,
    results: StatesAndDefaults | undefined
  ): void {
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
    this._internalStateOperations
      .getRootStateOperations()
      .dispatch(action)
      .pipe(
        mergeMap(() => {
          // If no states are provided, we safely complete the stream
          // and do not proceed further.
          if (!results) {
            return EMPTY;
          }

          this._invokeInitOnStates(results!.states);
          return this._appBootstrappedState;
        })
      )
      .subscribe(appBootstrapped => {
        if (appBootstrapped) {
          this._invokeBootstrapOnStates(results!.states);
        }
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
          .pipe(
            // Ensure initial state is captured
            startWith(undefined),
            // `skip` is using `filter` internally.
            skip(1)
          )
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
    return this._stateContextFactory.createStateContext(mappedStore.path);
  }
}
