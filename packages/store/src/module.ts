import { APP_BOOTSTRAP_LISTENER, ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsBootstrapper } from '@ngxs/store/internals';

import {
  FEATURE_STATE_TOKEN,
  ModuleOptions,
  NgxsConfig,
  ROOT_OPTIONS,
  ROOT_STATE_TOKEN
} from './symbols';
import { NGXS_EXECUTION_STRATEGY } from './execution/symbols';
import { StateFactory } from './internal/state-factory';
import { StateContextFactory } from './internal/state-context-factory';
import { Actions, InternalActions } from './actions-stream';
import { ConfigValidator } from './internal/config-validator';
import { LifecycleStateManager } from './internal/lifecycle-state-manager';
import { InternalDispatchedActionResults, InternalDispatcher } from './internal/dispatcher';
import { InternalStateOperations } from './internal/state-operations';
import { Store } from './store';
import { SelectFactory } from './decorators/select';
import { StateStream } from './internal/state-stream';
import { PluginManager } from './plugin-manager';
import {
  appBootstrapListenerFactory,
  ngxsConfigFactory,
  StateClass
} from './internal/internals';
import { NgxsRootModule } from './modules/ngxs-root.module';
import { NgxsFeatureModule } from './modules/ngxs-feature.module';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './execution/dispatchOutsideZoneNgxsExecutionStrategy';
import { InternalNgxsExecutionStrategy } from './execution/internalNgxsExecutionStrategy';
import { InitState, UpdateState } from './actions/actions';
import { StateClass } from './internal/internals';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './execution/dispatch-outside-zone-ngxs-execution-strategy';
import { InternalNgxsExecutionStrategy } from './execution/internal-ngxs-execution-strategy';

/**
 * Ngxs Module
 */
@NgModule()
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
