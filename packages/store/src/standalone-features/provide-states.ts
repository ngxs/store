import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { StateClass } from '@ngxs/store/internals';

import { getFeatureProviders } from './feature-providers';
import { NGXS_FEATURE_ENVIRONMENT_INITIALIZER } from './initializers';

/**
 * This version serves as a standalone alternative to `NgxsModule.forFeature`.
 * It can be used in a similar manner to register feature states, but at the
 * `Route` providers level:
 *
 * ```ts
 * const routes: Routes = [
 *   {
 *     path: 'products',
 *     loadComponent: async () => {...},
 *     providers: [provideStates([ProductsState])]
 *   }
 * ];
 * ```
 */
export function provideStates(
  states: StateClass[],
  ...features: EnvironmentProviders[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...getFeatureProviders(states),
    features,
    NGXS_FEATURE_ENVIRONMENT_INITIALIZER
  ]);
}
