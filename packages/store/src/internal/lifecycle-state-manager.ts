import { Injectable } from '@angular/core';
import { NgxsBootstrapper, PlainObject } from '@ngxs/store/internals';
import { filter, mergeMap, tap } from 'rxjs/operators';

import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { getStateDiffChanges, MappedStore, StatesAndDefaults } from './internals';
import { NgxsLifeCycle, NgxsSimpleChange, StateContext } from '../symbols';

@Injectable()
export class LifecycleStateManager {
  constructor(
    private internalStateOperations: InternalStateOperations,
    private stateContextFactory: StateContextFactory,
    private bootstrapper: NgxsBootstrapper
  ) {}

  ngxsBootstrap<T>(action: T, results: StatesAndDefaults | undefined): void {
    this.internalStateOperations
      .getRootStateOperations()
      .dispatch(action)
      .pipe(
        filter(() => !!results),
        tap(() => this.invokeInit(results!.states)),
        mergeMap(() => this.bootstrapper.appBootstrapped$),
        filter(appBootstrapped => !!appBootstrapped)
      )
      .subscribe(() => this.invokeBootstrap(results!.states));
  }

  /**
   * Invoke the init function on the states.
   */
  invokeInit(mappedStores: MappedStore[]): void {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;

      if (instance.ngxsOnChanges) {
        const currentAppState: PlainObject = {};
        const newAppState: PlainObject = this.internalStateOperations
          .getRootStateOperations()
          .getState();

        const firstDiffChange: NgxsSimpleChange = getStateDiffChanges(mappedStore, {
          currentAppState,
          newAppState
        });

        instance.ngxsOnChanges(firstDiffChange);
      }

      if (instance.ngxsOnInit) {
        instance.ngxsOnInit(this.getStateContext(mappedStore));
      }

      mappedStore.isInitialised = true;
    }
  }

  /**
   * Invoke the bootstrap function on the states.
   */
  invokeBootstrap(mappedStores: MappedStore[]) {
    for (const mappedStore of mappedStores) {
      const instance: NgxsLifeCycle = mappedStore.instance;
      if (instance.ngxsAfterBootstrap) {
        instance.ngxsAfterBootstrap(this.getStateContext(mappedStore));
      }
    }
  }

  private getStateContext(mappedStore: MappedStore): StateContext<any> {
    return this.stateContextFactory.createStateContext(mappedStore);
  }
}
