import { Inject, NgModule, Optional, Type } from '@angular/core';

import { Store } from '../store';
import { InternalStateOperations } from '../internal/state-operations';
import { StateFactory } from '../internal/state-factory';
import { FEATURE_STATE_TOKEN } from '../symbols';
import { StateClass } from '../internal/internals';
import { UpdateState } from '../actions/actions';

/**
 * Feature module
 * @ignore
 */
@NgModule({})
export class NgxsFeatureModule {
  constructor(
    store: Store,
    internalStateOperations: InternalStateOperations,
    factory: StateFactory,
    @Optional()
    @Inject(FEATURE_STATE_TOKEN)
    lazyStates: StateClass[][]
  ) {
    const action: Type<unknown> = UpdateState;
    const states: StateClass[] = [].concat(...(lazyStates as any));
    internalStateOperations.ngxsBootstrap({ factory, states, action });
  }
}
