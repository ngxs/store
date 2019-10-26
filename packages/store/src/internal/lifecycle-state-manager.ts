import { Injectable } from '@angular/core';
import { NgxsBootstrapper, PlainObject } from '@ngxs/store/internals';
import { filter, mergeMap, tap } from 'rxjs/operators';

import { StateContextFactory } from './state-context-factory';
import { InternalStateOperations } from './state-operations';
import { getStateDiffChanges, MappedStore, StatesAndDefaults } from './internals';
import { NgxsSimpleChange, NgxsStateInstance, StateContext } from '../symbols';

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
  invokeInit(stateMetadatas: MappedStore[]): void {
    for (const metadata of stateMetadatas) {
      const instance: NgxsStateInstance = metadata.instance!;

      if (instance.ngxsOnChanges) {
        const currentAppState: PlainObject = {};
        const newAppState: PlainObject = this.internalStateOperations
          .getRootStateOperations()
          .getState();

        const firstDiffChange: NgxsSimpleChange = getStateDiffChanges(metadata, {
          currentAppState,
          newAppState
        });

        instance.ngxsOnChanges(firstDiffChange);
      }

      if (instance.ngxsOnInit) {
        instance.ngxsOnInit(this.getStateContext(metadata));
      }

      metadata.isInitialised = true;
    }
  }

  /**
   * Invoke the bootstrap function on the states.
   */
  invokeBootstrap(stateMetadatas: MappedStore[]) {
    for (const metadata of stateMetadatas) {
      const instance: NgxsStateInstance = metadata.instance!;
      if (instance.ngxsAfterBootstrap) {
        instance.ngxsAfterBootstrap(this.getStateContext(metadata));
      }
    }
  }

  private getStateContext(metadata: MappedStore): StateContext<any> {
    return this.stateContextFactory.createStateContext(metadata);
  }
}
