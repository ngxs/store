import { Inject, NgModule, Optional } from '@angular/core';

import { Store } from '../store';
import { InternalStateOperations } from '../internal/state-operations';
import { StateFactory } from '../internal/state-factory';
import { FEATURE_STATE_TOKEN } from '../symbols';
import { LifecycleStateManager } from '../internal/lifecycle-state-manager';
import { StateClassInternal, StatesAndDefaults } from '../internal/internals';
import { UpdateState } from '../actions/actions';

/**
 * Feature module
 * @ignore
 */
@NgModule()
export class NgxsFeatureModule {
  constructor(
    _store: Store,
    internalStateOperations: InternalStateOperations,
    factory: StateFactory,
    @Optional()
    @Inject(FEATURE_STATE_TOKEN)
    states: StateClassInternal[][] = [],
    lifecycleStateManager: LifecycleStateManager
  ) {
    // Since FEATURE_STATE_TOKEN is a multi token, we need to
    // flatten it [[Feature1State, Feature2State], [Feature3State]]
    const flattenedStates: StateClassInternal[] = NgxsFeatureModule.flattenStates(states);

    // add stores to the state graph and return their defaults
    const results: StatesAndDefaults = factory.addAndReturnDefaults(flattenedStates);

    if (results.states.length) {
      internalStateOperations.setStateToTheCurrentWithNew(results);

      // dispatch the update action and invoke init and bootstrap functions after
      lifecycleStateManager.ngxsBootstrap(new UpdateState(results.defaults), results);
    }
  }

  private static flattenStates(states: StateClassInternal[][] = []): StateClassInternal[] {
    return states.reduce(
      (total: StateClassInternal[], values: StateClassInternal[]) => total.concat(values),
      []
    );
  }
}
