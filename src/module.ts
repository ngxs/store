import { NgModule, ModuleWithProviders, Optional, Inject, SkipSelf } from '@angular/core';

import { STORE_TOKEN, STORE_OPTIONS_TOKEN, NgxsOptions, NGXS_PLUGINS } from './symbols';
import { StoreFactory } from './factory';
import { EventStream } from './event-stream';
import { Ngxs } from './ngxs';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { InitStore } from './events/init';

@NgModule({
  providers: [{ provide: NGXS_PLUGINS, useValue: [] }]
})
export class NgxsRootModule {
  constructor(
    private _factory: StoreFactory,
    private _stateStream: StateStream,
    store: Ngxs,
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
  static forRoot(stores: any[], options: NgxsOptions = { plugins: [] }): ModuleWithProviders {
    return {
      ngModule: NgxsRootModule,
      providers: [
        StoreFactory,
        EventStream,
        Ngxs,
        StateStream,
        SelectFactory,
        PluginManager,
        stores,
        options.plugins,
        {
          provide: STORE_TOKEN,
          useValue: stores
        },
        {
          provide: STORE_OPTIONS_TOKEN,
          useValue: options
        }
      ]
    };
  }

  static forFeature(stores: any[], options: NgxsOptions = { plugins: [] }): ModuleWithProviders {
    return {
      ngModule: NgxsFeatureModule,
      providers: [
        stores,
        options.plugins,
        StoreFactory,
        PluginManager,
        {
          provide: STORE_TOKEN,
          useValue: stores
        },
        {
          provide: STORE_OPTIONS_TOKEN,
          useValue: options
        }
      ]
    };
  }
}
