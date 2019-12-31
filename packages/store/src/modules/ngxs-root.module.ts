import { Inject, NgModule, Optional } from '@angular/core';

import { StateFactory } from '../internal/state-factory';
import { InternalStateOperations } from '../internal/state-operations';
import { Store } from '../store';
import { SelectFactory } from '../decorators/select/select-factory';
import { ROOT_STATE_TOKEN } from '../symbols';
import { StateClassInternal, StatesAndDefaults } from '../internal/internals';
import { LifecycleStateManager } from '../internal/lifecycle-state-manager';
import { InitState } from '../actions/actions';
import { setIvyEnabledInDevMode } from '../ivy/ivy-enabled-in-dev-mode';

/**
 * Root module
 * @ignore
 */
@NgModule()
export class NgxsRootModule {
  constructor(
    factory: StateFactory,
    internalStateOperations: InternalStateOperations,
    _store: Store,
    _select: SelectFactory,
    @Optional()
    @Inject(ROOT_STATE_TOKEN)
    states: StateClassInternal[] = [],
    lifecycleStateManager: LifecycleStateManager
  ) {
    // Validate states on having the `@Injectable()` decorator in Ivy
    setIvyEnabledInDevMode();

    // Add stores to the state graph and return their defaults
    const results: StatesAndDefaults = factory.addAndReturnDefaults(states);

    internalStateOperations.setStateToTheCurrentWithNew(results);

    // Connect our actions stream
    factory.connectActionHandlers();

    // Dispatch the init action and invoke init and bootstrap functions after
    lifecycleStateManager.ngxsBootstrap(new InitState(), results);
  }
}
