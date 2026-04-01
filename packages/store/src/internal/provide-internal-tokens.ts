import { makeEnvironmentProviders } from '@angular/core';
import {
  ɵNGXS_STATE_CONTEXT_FACTORY,
  ɵNGXS_STATE_FACTORY,
  type ɵPlainObjectOf
} from '@ngxs/store/internals';

import { StateFactory } from './state-factory';
import { StateContextFactory } from './state-context-factory';
import type { MappedStore, StatesByName } from './internals';

// Backward compatibility is provided because these tokens are used by third-party
// libraries. We expose a separate function to allow tree-shaking of these tokens
// if they are not used in standard applications that do not rely on them.
export function ɵprovideNgxsInternalStateTokens() {
  return makeEnvironmentProviders([
    {
      provide: ɵNGXS_STATE_CONTEXT_FACTORY,
      useExisting: StateContextFactory
    },
    {
      provide: ɵNGXS_STATE_FACTORY,
      useExisting: StateFactory
    }
  ]);
}

// For internal third-party usage only.
// Provides a type-safe accessor for `StateFactory`'s private fields so that
// third-party consumers do not have to cast or use bracket notation themselves.
export function ɵgetTypedNgxsStateFactory(stateFactory: any): {
  states: MappedStore[];
  statesByName: StatesByName;
  statePaths: ɵPlainObjectOf<string>;
} {
  return {
    // The flat list of all registered mapped stores.
    states: stateFactory['_states'],
    // A name-keyed map of all registered states.
    statesByName: stateFactory['_statesByName'],
    // A map of dot-separated state paths (e.g. "parent.child") to each state's name.
    statePaths: stateFactory['_statePaths']
  };
}
