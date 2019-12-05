import {
  APP_BOOTSTRAP_LISTENER,
  InjectionToken,
  isDevMode,
  ModuleWithProviders,
  NgModule,
  Provider
} from '@angular/core';
import {
  INITIAL_STATE_TOKEN,
  InitialState,
  isAngularInTestMode,
  NGXS_STATE_CONTEXT_FACTORY,
  NGXS_STATE_FACTORY,
  NgxsBootstrapper,
  StateClass
} from '@ngxs/store/internals';

import {
  FEATURE_STATE_TOKEN,
  NG_DEV_MODE,
  NG_TEST_MODE,
  NgxsConfig,
  NgxsModuleOptions,
  ROOT_STATE_TOKEN
} from './symbols';
import { NGXS_EXECUTION_STRATEGY } from './execution/symbols';
import { StateFactory } from './internal/state-factory';
import { StateContextFactory } from './internal/state-context-factory';
import { Actions, InternalActions } from './actions-stream';
import { LifecycleStateManager } from './internal/lifecycle-state-manager';
import { InternalDispatchedActionResults, InternalDispatcher } from './internal/dispatcher';
import { InternalStateOperations } from './internal/state-operations';
import { Store } from './store';
import { SelectFactory } from './decorators/select/select-factory';
import { StateStream } from './internal/state-stream';
import { PluginManager } from './plugin-manager';
import { NgxsRootModule } from './modules/ngxs-root.module';
import { NgxsFeatureModule } from './modules/ngxs-feature.module';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './execution/dispatch-outside-zone-ngxs-execution-strategy';
import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';
import { HostEnvironment } from './host-environment/host-environment';
import { ConfigValidator } from './internal/config-validator';

/**
 * Ngxs Module
 */
@NgModule()
export class NgxsModule {
  private static readonly ROOT_OPTIONS = new InjectionToken<NgxsModuleOptions>('ROOT_OPTIONS');

  /**
   * Root module factory
   */
  public static forRoot(
    states: StateClass[] = [],
    options: NgxsModuleOptions = {}
  ): ModuleWithProviders<NgxsRootModule> {
    return {
      ngModule: NgxsRootModule,
      providers: [
        StateFactory,
        StateContextFactory,
        Actions,
        InternalActions,
        NgxsBootstrapper,
        ConfigValidator,
        HostEnvironment,
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
        ...NgxsModule.ngxsTokenProviders(states, options)
      ]
    };
  }

  /**
   * Feature module factory
   */
  public static forFeature(states: StateClass[] = []): ModuleWithProviders<NgxsFeatureModule> {
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

  private static ngxsTokenProviders(
    states: StateClass[],
    options: NgxsModuleOptions
  ): Provider[] {
    return [
      {
        provide: NG_TEST_MODE,
        useValue: isAngularInTestMode
      },
      {
        provide: NG_DEV_MODE,
        useValue: isDevMode
      },
      {
        provide: NGXS_EXECUTION_STRATEGY,
        useClass: options.executionStrategy || DispatchOutsideZoneNgxsExecutionStrategy
      },
      {
        provide: ROOT_STATE_TOKEN,
        useValue: states
      },
      {
        provide: NgxsModule.ROOT_OPTIONS,
        useValue: options
      },
      {
        provide: NgxsConfig,
        useFactory: NgxsModule.ngxsConfigFactory,
        deps: [NgxsModule.ROOT_OPTIONS]
      },
      {
        provide: APP_BOOTSTRAP_LISTENER,
        useFactory: NgxsModule.appBootstrapListenerFactory,
        multi: true,
        deps: [NgxsBootstrapper]
      },
      {
        provide: INITIAL_STATE_TOKEN,
        useFactory: NgxsModule.getInitialState
      },
      {
        provide: NGXS_STATE_CONTEXT_FACTORY,
        useExisting: StateContextFactory
      },
      {
        provide: NGXS_STATE_FACTORY,
        useExisting: StateFactory
      }
    ];
  }

  private static ngxsConfigFactory(options: NgxsModuleOptions): NgxsConfig {
    return Object.assign(new NgxsConfig(), options);
  }

  private static appBootstrapListenerFactory(bootstrapper: NgxsBootstrapper): Function {
    return () => bootstrapper.bootstrap();
  }

  private static getInitialState() {
    return InitialState.pop();
  }
}
