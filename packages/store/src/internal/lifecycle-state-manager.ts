import { Injectable } from '@angular/core';

import { filter, tap, mergeMap } from 'rxjs/operators';

import { StateFactory } from './state-factory';
import { Bootstrapper } from './bootstrapper';
import { InternalStateOperations } from './state-operations';
import { MappedStore, StatesAndDefaults } from './internals';
import { LifecycleHooks, NgxsLifeCycle } from '../symbols';

interface BootstrapOptions<T> {
  internalStateOperations: InternalStateOperations;
  action: T;
  results: StatesAndDefaults;
  factory: StateFactory;
  bootsrapper: Bootstrapper;
}

@Injectable()
export class LifecycleStateManager {
  ngxsBootstrap<T>({
    internalStateOperations,
    action,
    results,
    factory,
    bootsrapper
  }: BootstrapOptions<T>): void {
    internalStateOperations
      .getRootStateOperations()
      .dispatch(action)
      .pipe(
        filter(() => !!results),
        tap(() => this.invokeInit(factory, results!.states)),
        mergeMap(() => bootsrapper.appBootstrapped$),
        filter(appBootrapped => !!appBootrapped)
      )
      .subscribe(() => {
        this.invokeBootstrap(factory, results!.states);
      });
  }

  /**
   * Invoke the bootstrap function on the states.
   */
  invokeInit(factory: StateFactory, stateMetadatas: MappedStore[]): void {
    this.invokeLifecycleHooks(factory, stateMetadatas, LifecycleHooks.NgxsOnInit);
  }

  /**
   * Invoke the bootstrap function on the states.
   */
  invokeBootstrap(factory: StateFactory, stateMetadatas: MappedStore[]) {
    this.invokeLifecycleHooks(factory, stateMetadatas, LifecycleHooks.NgxsAfterBootstrap);
  }

  private invokeLifecycleHooks(
    factory: StateFactory,
    stateMetadatas: MappedStore[],
    hook: LifecycleHooks
  ): void {
    for (const metadata of stateMetadatas) {
      const instance: NgxsLifeCycle = metadata.instance;

      if (instance[hook]) {
        const stateContext = factory.createStateContext(metadata);
        instance[hook]!(stateContext);
      }
    }
  }
}
