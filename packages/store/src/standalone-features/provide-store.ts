import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ɵStateClass } from '@ngxs/store/internals';

import { NgxsModuleOptions } from '../symbols';
import { getRootProviders } from './root-providers';
import { NGXS_ROOT_ENVIRONMENT_INITIALIZER } from './initializers';

/**
 * This function provides global store providers and initializes the store.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideStore([CountriesState])]
 * });
 * ```
 *
 * The `provideStore` may be optionally called with a config before the list of features:
 *
 * ```ts
 * provideStore([CountriesState], {
 *   developmentMode: !environment.production
 * });
 * ```
 */
export function provideStore(
  states: ɵStateClass[] = [],
  options: NgxsModuleOptions,
  ...features: EnvironmentProviders[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...getRootProviders(states, options),
    NGXS_ROOT_ENVIRONMENT_INITIALIZER,
    features
  ]);
}
