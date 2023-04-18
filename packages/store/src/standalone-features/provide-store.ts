import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { StateClass } from '@ngxs/store/internals';

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
  states?: StateClass[],
  ...features: EnvironmentProviders[]
): EnvironmentProviders;

export function provideStore(
  states?: StateClass[],
  options?: NgxsModuleOptions,
  ...features: EnvironmentProviders[]
): EnvironmentProviders;

export function provideStore(
  states: StateClass[] = [],
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
    features,
    NGXS_ROOT_ENVIRONMENT_INITIALIZER
  ]);
}

function isEnvironmentProvider(target: any): target is EnvironmentProviders {
  return !!target.ɵproviders;
}
