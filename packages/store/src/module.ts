import { NgModule, ModuleWithProviders, Optional, Inject, InjectionToken } from '@angular/core';

import { ROOT_STATE_TOKEN, FEATURE_STATE_TOKEN, NgxsConfig } from './symbols';
import { StateFactory } from './internal/state-factory';
import { StateContextFactory } from './internal/state-context-factory';
import { Actions, InternalActions } from './actions-stream';
import { InternalDispatcher, InternalDispatchedActionResults } from './internal/dispatcher';
import { InternalStateOperations } from './internal/state-operations';
import { Store } from './store';
import { SelectFactory } from './decorators/select';
import { StateStream } from './internal/state-stream';
import { PluginManager } from './plugin-manager';
import { InitState, UpdateState } from './actions/actions';

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
    states: any[]
  ) {
    // add stores to the state graph and return their defaults
    const results = factory.addAndReturnDefaults(states);

    const stateOperations = internalStateOperations.getRootStateOperations();
    if (results) {
      // get our current stream
      const cur = stateOperations.getState();

      // set the state to the current + new
      stateOperations.setState({ ...cur, ...results.defaults });
    }

    // connect our actions stream
    factory.connectActionHandlers();

    // dispatch the init action and invoke init function after
    stateOperations.dispatch(new InitState()).subscribe(() => {
      if (results) {
        factory.invokeInit(results.states);
      }
    });
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
    states: any[][]
  ) {
    // Since FEATURE_STATE_TOKEN is a multi token, we need to
    // flatten it [[Feature1State, Feature2State], [Feature3State]]
    const flattenedStates = ([] as any[]).concat(...states);

    // add stores to the state graph and return their defaults
    const results = factory.addAndReturnDefaults(flattenedStates);

    const stateOperations = internalStateOperations.getRootStateOperations();
    if (results) {
      // get our current stream
      const cur = stateOperations.getState();

      // set the state to the current + new
      stateOperations.setState({ ...cur, ...results.defaults });
    }

    stateOperations.dispatch(new UpdateState()).subscribe(() => {
      if (results) {
        factory.invokeInit(results.states);
      }
    });
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
  static forRoot(states: any[] = [], options: ModuleOptions = {}): ModuleWithProviders {
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
  static forFeature(states: any[]): ModuleWithProviders {
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
