import { Inject, NgModule, Optional, Type } from '@angular/core';

import { StateFactory } from '../internal/state-factory';
import { InternalStateOperations } from '../internal/state-operations';
import { Store } from '../store';
import { SelectFactory } from '../decorators/select';
import { ROOT_STATE_TOKEN } from '../symbols';
import { StateClass } from '../internal/internals';
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
    states: StateClass[]
  ) {
    const action: Type<unknown> = InitState;
    const ngxsAfterBootstrap: Function = () => factory.connectActionHandlers();
    internalStateOperations.ngxsBootstrap({ factory, states, action, ngxsAfterBootstrap });
  }
}
