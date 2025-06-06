import { Provider } from '@angular/core';
import { ɵStateClass } from '@ngxs/store/internals';

import { FEATURE_STATE_TOKEN } from '../symbols';
import { PluginManager } from '../plugin-manager';

/**
 * This function provides the required providers when calling `NgxsModule.forFeature`
 * or `provideStates`. It is shared between the NgModule and standalone APIs.
 */
export function getFeatureProviders(states: ɵStateClass[]): Provider[] {
  return [
    PluginManager,
    ...states,
    {
      provide: FEATURE_STATE_TOKEN,
      multi: true,
      useValue: states
    }
  ];
}
