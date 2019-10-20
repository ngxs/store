import { Injectable } from '@angular/core';
import { NgxsBootstrapper, PlainObject } from '@ngxs/store/internals';
import { filter, mergeMap, tap } from 'rxjs/operators';

import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { getStateDiffChanges, MappedStore, StatesAndDefaults } from './internals';
import { LifecycleHooks, NgxsLifeCycle, NgxsSimpleChange } from '../symbols';

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
      .subscribe(() => {
        this.invokeBootstrap(results!.states);
      });
  }

  /**
   * Invoke the init function on the states.
   */
  invokeInit(stateMetadatas: MappedStore[]): void {
    this.invokeOnChanges(stateMetadatas);
    this.invokeLifecycleHooks(stateMetadatas, LifecycleHooks.NgxsOnInit);
  }

  /**
   * Invoke the on changes function on the states.
   */
  invokeOnChanges(stateMetadatas: MappedStore[]): void {
    for (const metadata of stateMetadatas) {
      const instance: NgxsLifeCycle = metadata.instance;
      if (instance.ngxsOnChanges) {
        const currentAppState: PlainObject = {};
        const newAppState: PlainObject = this.internalStateOperations
          .getRootStateOperations()
          .getState();

        const firstDiffChange: NgxsSimpleChange = getStateDiffChanges(metadata, {
          currentAppState,
          newAppState
        });

        instance.ngxsOnChanges!(firstDiffChange);
      }
    }
  }

  /**
   * Invoke the bootstrap function on the states.
   */
  invokeBootstrap(stateMetadatas: MappedStore[]) {
    this.invokeLifecycleHooks(stateMetadatas, LifecycleHooks.NgxsAfterBootstrap);
  }

  private invokeLifecycleHooks(stateMetadatas: MappedStore[], hook: LifecycleHooks): void {
    for (const metadata of stateMetadatas) {
      const instance: NgxsLifeCycle = metadata.instance;

      if (instance[hook]) {
        const stateContext = this.stateContextFactory.createStateContext(metadata);
        instance[hook]!(stateContext);
      }
    }
  }
}
