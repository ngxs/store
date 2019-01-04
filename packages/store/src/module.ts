import {
  Inject,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  Optional,
  Type
} from '@angular/core';

import { FEATURE_STATE_TOKEN, NgxsConfig, ROOT_STATE_TOKEN } from './symbols';
import { StateFactory } from './internal/state-factory';
import { StateContextFactory } from './internal/state-context-factory';
import { Actions, InternalActions } from './actions-stream';
import { InternalDispatchedActionResults, InternalDispatcher } from './internal/dispatcher';
import { InternalStateOperations } from './internal/state-operations';
import { Store } from './store';
import { SelectFactory } from './decorators/select';
import { StateStream } from './internal/state-stream';
import { PluginManager } from './plugin-manager';
import { InitState, UpdateState } from './actions/actions';
import { StateClass } from './internal/internals';

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
    states: StateClass[]
  ) {
    const action: Type<unknown> = InitState;
    const ngxsAfterBootstrap: Function = () => factory.connectActionHandlers();
    internalStateOperations.ngxsBootstrap({ factory, states, action, ngxsAfterBootstrap });
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
    lazyStates: StateClass[][]
  ) {
    const action: Type<unknown> = UpdateState;
    const states: StateClass[] = [].concat(...(lazyStates as any));
    internalStateOperations.ngxsBootstrap({ factory, states, action });
  }
}

export type ModuleOptions = Partial<NgxsConfig>;

export function ngxsConfigFactory(options: ModuleOptions): NgxsConfig {
  const config = Object.assign(new NgxsConfig(), options);
  return config;
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
        InternalDispatcher,
        InternalDispatchedActionResults,
        InternalStateOperations,
        Store,
        StateStream,
        SelectFactory,
        PluginManager,
        ...states,
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
