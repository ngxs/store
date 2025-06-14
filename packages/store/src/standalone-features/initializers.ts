import {
  InjectionToken,
  Provider,
  inject,
  provideEnvironmentInitializer
} from '@angular/core';
import { ɵStateClassInternal } from '@ngxs/store/internals';

import { Store } from '../store';
import { NGXS_PREBOOT_FNS } from './preboot';
import { InitState, UpdateState } from '../plugin_api';
import { FEATURE_STATE_TOKEN, ROOT_STATE_TOKEN } from '../symbols';
import { StateFactory } from '../internal/state-factory';
import { StatesAndDefaults } from '../internal/internals';
import { assertRootStoreNotInitialized } from './root-guard';
import { InternalStateOperations } from '../internal/state-operations';
import { LifecycleStateManager } from '../internal/lifecycle-state-manager';
import { installOnUnhandhedErrorHandler } from '../internal/unhandled-rxjs-error-callback';

/**
 * This function is shared by both NgModule and standalone features.
 * When using `NgxsModule.forRoot` and `provideStore`, we can depend on the
 * same initialization functionality.
 */
export function rootStoreInitializer(): void {
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    assertRootStoreNotInitialized();
  }

  // Override the RxJS `config.onUnhandledError` within the root store initializer,
  // but only after other code has already executed.
  // If users have a custom `config.onUnhandledError`, we might overwrite it too
  // early and capture the original `config.onUnhandledError` before it is properly set.
  installOnUnhandhedErrorHandler();

  const prebootFns = inject(NGXS_PREBOOT_FNS, { optional: true }) || [];
  prebootFns.forEach(prebootFn => prebootFn());

  const factory = inject(StateFactory);
  const internalStateOperations = inject(InternalStateOperations);

  inject(Store);

  const states = inject(ROOT_STATE_TOKEN, { optional: true }) || [];
  const lifecycleStateManager = inject(LifecycleStateManager);

  // Add stores to the state graph and return their defaults.
  const results: StatesAndDefaults = factory.addAndReturnDefaults(states);

  internalStateOperations.setStateToTheCurrentWithNew(results);

  // Connect our actions stream.
  factory.connectActionHandlers();

  // Dispatch the init action and invoke init and bootstrap functions after.
  lifecycleStateManager.ngxsBootstrap(new InitState(), results);
}

/**
 * This function is utilized by both NgModule and standalone features.
 * When using `NgxsModule.forFeature` and `provideStates`, we can depend on
 * the same initialization functionality.
 */
export function featureStatesInitializer(): void {
  inject(Store);

  const internalStateOperations = inject(InternalStateOperations);
  const factory = inject(StateFactory);
  const states = inject(FEATURE_STATE_TOKEN, { optional: true }) || [];
  const lifecycleStateManager = inject(LifecycleStateManager);

  // Since FEATURE_STATE_TOKEN is a multi token, we need to
  // flatten it [[Feature1State, Feature2State], [Feature3State]].
  const flattenedStates: ɵStateClassInternal[] = states.reduce(
    (total: ɵStateClassInternal[], values: ɵStateClassInternal[]) => total.concat(values),
    []
  );

  // add stores to the state graph and return their defaults.
  const results: StatesAndDefaults = factory.addAndReturnDefaults(flattenedStates);

  if (results.states.length) {
    internalStateOperations.setStateToTheCurrentWithNew(results);

    // Dispatch the update action and invoke init and bootstrap functions after.
    lifecycleStateManager.ngxsBootstrap(new UpdateState(results.defaults), results);
  }
}

/**
 * InjectionToken that registers the global Store.
 */
export const NGXS_ROOT_STORE_INITIALIZER = new InjectionToken<void>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_ROOT_STORE_INITIALIZER' : ''
);

/**
 * InjectionToken that registers feature states.
 */
export const NGXS_FEATURE_STORE_INITIALIZER = new InjectionToken<void>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_FEATURE_STORE_INITIALIZER' : ''
);

export const NGXS_ROOT_ENVIRONMENT_INITIALIZER: Provider = [
  { provide: NGXS_ROOT_STORE_INITIALIZER, useFactory: rootStoreInitializer },
  provideEnvironmentInitializer(() => inject(NGXS_ROOT_STORE_INITIALIZER))
];

/**
 * The `NGXS_FEATURE_ENVIRONMENT_INITIALIZER` functions as an environment initializer
 * at the `Route` level. Angular Router creates an environment route injector for each
 * matched route where navigation occurs. The injector is created once, ensuring that
 * the feature states initialization only happens once as well.
 */
export const NGXS_FEATURE_ENVIRONMENT_INITIALIZER: Provider = [
  { provide: NGXS_FEATURE_STORE_INITIALIZER, useFactory: featureStatesInitializer },
  provideEnvironmentInitializer(() => inject(NGXS_FEATURE_STORE_INITIALIZER))
];
