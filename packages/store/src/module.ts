import { NgModule, ModuleWithProviders, Optional, Inject } from '@angular/core';

import { ROOT_STATE_TOKEN, FEATURE_STATE_TOKEN } from './symbols';
import { StateFactory } from './state-factory';
import { Actions, InternalActions } from './actions-stream';
import { InternalDispatcher, InternalDispatchedActionResults } from './dispatcher';
import { Store } from './store';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { InitState, UpdateState } from './actions';

/**
 * Root module
 * @ignore
 */
@NgModule()
export class NgxsRootModule {
  constructor(
    factory: StateFactory,
    stateStream: StateStream,
    store: Store,
    select: SelectFactory,
    @Optional()
    @Inject(ROOT_STATE_TOKEN)
    states: any[]
  ) {
    // add stores to the state graph and return their defaults
    const results = factory.addAndReturnDefaults(states);

    if (results) {
      // get our current stream
      const cur = stateStream.getValue();

      // set the state to the current + new
      stateStream.next({ ...cur, ...results.defaults });
    }

    // connect our actions stream
    factory.connectActionHandlers();

    // dispatch the init action and invoke init function after
    store.dispatch(new InitState()).subscribe(() => {
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
    stateStream: StateStream,
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
    if (results) {
      // get our current stream
      const cur = stateStream.getValue();

      // set the state to the current + new
      stateStream.next({ ...cur, ...results.defaults });
    }

    store.dispatch(new UpdateState()).subscribe(() => {
      if (results) {
        factory.invokeInit(results.states);
      }
    });
  }
}

/**
 * Ngxs Module
 */
@NgModule({})
export class NgxsModule {
  /**
   * Root module factory
   */
  static forRoot(states: any[] = []): ModuleWithProviders {
    return {
      ngModule: NgxsRootModule,
      providers: [
        StateFactory,
        Actions,
        InternalActions,
        InternalDispatcher,
        InternalDispatchedActionResults,
        Store,
        StateStream,
        SelectFactory,
        PluginManager,
        ...states,
        {
          provide: ROOT_STATE_TOKEN,
          useValue: states
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
