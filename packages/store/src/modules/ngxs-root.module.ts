import { Inject, NgModule, Optional } from '@angular/core';

import { StateFactory } from '../internal/state-factory';
import { InternalStateOperations } from '../internal/state-operations';
import { Store } from '../store';
import { SelectFactory } from '../decorators/select';
import { ROOT_STATE_TOKEN } from '../symbols';
import { StateClass, StatesAndDefaults } from '../internal/internals';
import { LifecycleStateManager } from '../internal/lifecycle-state-manager';
import { InitState } from '../actions/actions';

/**
 * Root module
 * @ignore
 */
@NgModule()
export class NgxsRootModule {
  constructor(
    factory: StateFactory,
    internalStateOperations: InternalStateOperations,
    store: Store,
    select: SelectFactory,
    @Optional()
    @Inject(ROOT_STATE_TOKEN)
    states: StateClass[] = [],
    lifecycleStateManager: LifecycleStateManager
  ) {
    // add stores to the state graph and return their defaults
    const results: StatesAndDefaults = factory.addAndReturnDefaults(states);

    internalStateOperations.setStateToTheCurrentWithNew(results);

    // connect our actions stream
    factory.connectActionHandlers();

    // dispatch the init action and invoke init and bootstrap functions after
    lifecycleStateManager.ngxsBootstrap(new InitState(), results);
  }
}
