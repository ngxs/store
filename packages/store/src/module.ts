import {
  NgModule,
  ModuleWithProviders,
  Optional,
  Inject,
  InjectionToken,
  APP_BOOTSTRAP_LISTENER
} from '@angular/core';

import { NgxsBootstrapper } from '@ngxs/store/internals';

import { ROOT_STATE_TOKEN, FEATURE_STATE_TOKEN, NgxsConfig } from './symbols';
import { NGXS_EXECUTION_STRATEGY } from './execution/symbols';
import { StateFactory } from './internal/state-factory';
import { StateContextFactory } from './internal/state-context-factory';
import { Actions, InternalActions } from './actions-stream';
import { ConfigValidator } from './internal/config-validator';
import { LifecycleStateManager } from './internal/lifecycle-state-manager';
import { InternalDispatcher, InternalDispatchedActionResults } from './internal/dispatcher';
import { InternalStateOperations } from './internal/state-operations';
import { Store } from './store';
import { SelectFactory } from './decorators/select';
import { StateStream } from './internal/state-stream';
import { PluginManager } from './plugin-manager';
import { InitState, UpdateState } from './actions/actions';
import { StateClass } from './internal/internals';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './execution/dispatch-outside-zone-ngxs-execution-strategy';
import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';

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
    states: StateClass[] = [],
    lifecycleStateManager: LifecycleStateManager
  ) {
    // add stores to the state graph and return their defaults
    const results = factory.addAndReturnDefaults(states);

    internalStateOperations.setStateToTheCurrentWithNew(results);

    // connect our actions stream
    factory.connectActionHandlers();

    // dispatch the init action and invoke init and bootstrap functions after
    lifecycleStateManager.ngxsBootstrap(new InitState(), results);
  }
}

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
    states: any[][],
    lifecycleStateManager: LifecycleStateManager
  ) {
    // Since FEATURE_STATE_TOKEN is a multi token, we need to
    // flatten it [[Feature1State, Feature2State], [Feature3State]]
    const flattenedStates = ([] as any[]).concat(...states);

    // add stores to the state graph and return their defaults
    const results = factory.addAndReturnDefaults(flattenedStates);

    if (results.states.length) {
      internalStateOperations.setStateToTheCurrentWithNew(results);
      // dispatch the update action and invoke init and bootstrap functions after
      lifecycleStateManager.ngxsBootstrap(new UpdateState(), results);
    }
  }
}

export type ModuleOptions = Partial<NgxsConfig>;

export function ngxsConfigFactory(options: ModuleOptions): NgxsConfig {
  const config = Object.assign(new NgxsConfig(), options);
  return config;
}

export function appBootstrapListenerFactory(bootstrapper: NgxsBootstrapper) {
  return () => bootstrapper.bootstrap();
}

export const ROOT_OPTIONS = new InjectionToken<ModuleOptions>('ROOT_OPTIONS');

/**
 * Ngxs Module
 */
@NgModule({})
export class NgxsModule {
  /**
   * Root module factory
   */
  static forRoot(states: StateClass[] = [], options: ModuleOptions = {}): ModuleWithProviders {
    return {
      ngModule: NgxsRootModule,
      providers: [
        StateFactory,
        StateContextFactory,
        Actions,
        InternalActions,
        NgxsBootstrapper,
        ConfigValidator,
        LifecycleStateManager,
        InternalDispatcher,
        InternalDispatchedActionResults,
        InternalStateOperations,
        InternalNgxsExecutionStrategy,
        Store,
        StateStream,
        SelectFactory,
        PluginManager,
        ...states,
        {
          provide: NGXS_EXECUTION_STRATEGY,
          useClass: options.executionStrategy || DispatchOutsideZoneNgxsExecutionStrategy
        },
        {
          provide: ROOT_STATE_TOKEN,
          useValue: states
        },
        {
          provide: ROOT_OPTIONS,
          useValue: options
        },
        {
          provide: NgxsConfig,
          useFactory: ngxsConfigFactory,
          deps: [ROOT_OPTIONS]
        },
        {
          provide: APP_BOOTSTRAP_LISTENER,
          useFactory: appBootstrapListenerFactory,
          multi: true,
          deps: [NgxsBootstrapper]
        }
      ]
    };
  }

  /**
   * Feature module factory
   */
  static forFeature(states: StateClass[] = []): ModuleWithProviders {
    return {
      ngModule: NgxsFeatureModule,
      providers: [
        StateFactory,
        PluginManager,
        ...states,
        {
          provide: FEATURE_STATE_TOKEN,
          multi: true,
          useValue: states
        }
      ]
    };
  }
}
