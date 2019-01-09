import { Injectable } from '@angular/core';

import { filter, tap, mergeMap } from 'rxjs/operators';

import { StateContextFactory } from './state-context-factory';
import { Bootstrapper } from './bootstrapper';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { LifecycleHooks, NgxsLifeCycle } from '../symbols';

@Injectable()
export class LifecycleStateManager {
  constructor(
    private internalStateOperations: InternalStateOperations,
    private stateContextFactory: StateContextFactory,
    private bootstrapper: Bootstrapper
  ) {}

  ngxsBootstrap<T>(action: T, results: StatesAndDefaults | undefined): void {
    this.internalStateOperations
      .getRootStateOperations()
      .dispatch(action)
      .pipe(
        filter(() => !!results),
        tap(() => this.invokeInit(results!.states)),
        mergeMap(() => this.bootstrapper.appBootstrapped$),
        filter(appBootrapped => !!appBootrapped)
      )
      .subscribe(() => {
        this.invokeBootstrap(results!.states);
      });
  }

  /**
   * Invoke the bootstrap function on the states.
   */
  invokeInit(stateMetadatas: MappedStore[]): void {
    this.invokeLifecycleHooks(stateMetadatas, LifecycleHooks.NgxsOnInit);
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
