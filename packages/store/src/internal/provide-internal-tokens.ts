import { makeEnvironmentProviders } from '@angular/core';
import { ɵNGXS_STATE_CONTEXT_FACTORY, ɵNGXS_STATE_FACTORY } from '@ngxs/store/internals';

import { StateFactory } from './state-factory';
import { StateContextFactory } from './state-context-factory';

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
