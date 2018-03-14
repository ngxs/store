import { NgModule, ModuleWithProviders, Optional, Inject, SkipSelf } from '@angular/core';

import { STORE_TOKEN } from './symbols';
import { StoreFactory } from './factory';
import { EventStream } from './event-stream';
import { Store } from './store';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { InitStore } from './events/init';

@NgModule()
export class NgxsRootModule {
  constructor(
    private _factory: StoreFactory,
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
    private _factory: StoreFactory,
    @Optional()
    @Inject(STORE_TOKEN)
    stores: any[]
  ) {
    this.initStores(stores);
  }

  initStores(stores) {
    if (stores) {
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
        StoreFactory,
        EventStream,
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
        StoreFactory,
        PluginManager,
        {
          provide: STORE_TOKEN,
          useValue: stores
        }
      ]
    };
  }
}
