import { NgModule, ModuleWithProviders, Optional, Inject } from '@angular/core';

import { ROOT_STATE_TOKEN, FEATURE_STATE_TOKEN } from './symbols';
import { StateFactory } from './state-factory';
import { Actions } from './actions-stream';
import { Store } from './store';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { InitState } from './actions/init';

@NgModule()
export class NgxsRootModule {
  constructor(
    private _factory: StateFactory,
    private _stateStream: StateStream,
    store: Store,
    select: SelectFactory,
    @Optional()
    @Inject(ROOT_STATE_TOKEN)
    states: any[]
  ) {
    this.initStates(states);
    store.dispatch(new InitState());
  }

  initStates(states) {
    if (states) {
      if (!this._stateStream) {
        throw new Error(
          // tslint:disable-next-line
          `'NgxsModule.forRoot()' was not called at the root module. Please add it to the root module even if you don't have any root states.`
        );
      }
      // add stores to the state graph and return their defaults
      const init = this._factory.addAndReturnDefaults(states);

      // get our current stream
      const cur = this._stateStream.getValue();

      // set the state to the current + new
      this._stateStream.next({ ...cur, ...init });
    }
  }
}

@NgModule({})
export class NgxsFeatureModule {
  constructor(
    root: NgxsRootModule,
    store: Store,
    @Optional()
    @Inject(FEATURE_STATE_TOKEN)
    states: any[][]
  ) {
    // since FEATURE_STATE_TOKEN is a multi token, we need to flatten it [[Feature1State, Feature2State], [Feature3State]]
    const flattenedStates = ([] as any[]).concat(...states);
    root.initStates(flattenedStates);
  }
}

@NgModule({})
export class NgxsModule {
  static forRoot(states: any[] = []): ModuleWithProviders {
    return {
      ngModule: NgxsRootModule,
      providers: [
        StateFactory,
        Actions,
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
