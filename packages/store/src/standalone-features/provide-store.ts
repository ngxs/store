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
  states?: ɵStateClass[],
  ...features: EnvironmentProviders[]
): EnvironmentProviders;

export function provideStore(
  states?: ɵStateClass[],
  options?: NgxsModuleOptions,
  ...features: EnvironmentProviders[]
): EnvironmentProviders;

export function provideStore(
  states: ɵStateClass[] = [],
  ...optionsAndFeatures: any[]
): EnvironmentProviders {
  const features: EnvironmentProviders[] = [];
  // Options are empty by default (see `forRoot`).
  let options: NgxsModuleOptions = {};

  if (optionsAndFeatures.length > 0) {
    if (isEnvironmentProvider(optionsAndFeatures[0])) {
      features.push(...optionsAndFeatures);
    } else {
      options = optionsAndFeatures[0];
      features.push(...optionsAndFeatures.slice(1));
    }
  }

  return makeEnvironmentProviders([
    ...getRootProviders(states, options),
    NGXS_ROOT_ENVIRONMENT_INITIALIZER,
    features
  ]);
}

function isEnvironmentProvider(target: any): target is EnvironmentProviders {
  return !!target.ɵproviders;
}
