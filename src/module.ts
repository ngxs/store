import { NgModule, ModuleWithProviders, Optional, Inject, SkipSelf } from '@angular/core';

import { STORE_TOKEN } from './symbols';
import { StateFactory } from './state-factory';
import { Actions } from './actions-stream';
import { Store } from './store';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { InitStore } from './actions/init';

@NgModule()
export class NgxsRootModule {
  constructor(
    private _factory: StateFactory,
    private _stateStream: StateStream,
    store: Store,
    select: SelectFactory,
    @Optional()
    @Inject(STORE_TOKEN)
    stores: any[]
  ) {
    this.initStores(stores);
    store.dispatch(new InitStore());
  }

  initStores(stores) {
    if (stores) {
      const init = this._factory.addAndReturnDefaults(stores);

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
    @Optional()
    @SkipSelf()
    private _stateStream: StateStream,
    private _factory: StateFactory,
    @Optional()
    @Inject(STORE_TOKEN)
    stores: any[]
  ) {
    this.initStores(stores);
  }

  initStores(stores) {
    if (stores) {
      if (!this._stateStream) {
        throw new Error(`
          'NgxsModule.forRoot()' was not called at the root module.
          Please add it to the root module even if you don't have any root states.`);
      }

      // bind the stores
      const init = this._factory.addAndReturnDefaults(stores);

      // get our current stream
      const cur = this._stateStream.getValue();

      // set the state to the current + new
      this._stateStream.next({ ...cur, ...init });
    }
  }
}

@NgModule({})
export class NgxsModule {
  static forRoot(stores: any[]): ModuleWithProviders {
    return {
      ngModule: NgxsRootModule,
      providers: [
        StateFactory,
        Actions,
        Store,
        StateStream,
        SelectFactory,
        PluginManager,
        stores,
        {
          provide: STORE_TOKEN,
          useValue: stores
        }
      ]
    };
  }

  static forFeature(stores: any[]): ModuleWithProviders {
    return {
      ngModule: NgxsFeatureModule,
      providers: [
        stores,
        StateFactory,
        PluginManager,
        {
          provide: STORE_TOKEN,
          useValue: stores
        }
      ]
    };
  }
}
