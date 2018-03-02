import { NgModule, ModuleWithProviders, Optional, Inject } from '@angular/core';
import { STORE_TOKEN, LAZY_STORE_TOKEN, STORE_OPTIONS_TOKEN, LAZY_STORE_OPTIONS_TOKEN, NgxsOptions } from './symbols';
import { StoreFactory } from './factory';
import { EventStream } from './event-stream';
import { Ngxs } from './ngxs';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';

@NgModule({
  providers: [StoreFactory, EventStream, Ngxs, StateStream, SelectFactory, PluginManager]
})
export class NgxsModule {
  static forRoot(stores: any[], options?: NgxsOptions): ModuleWithProviders {
    return {
      ngModule: NgxsModule,
      providers: [
        StoreFactory,
        EventStream,
        Ngxs,
        StateStream,
        SelectFactory,
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

  static forFeature(stores: any[], options?: NgxsOptions): ModuleWithProviders {
    return {
      ngModule: NgxsModule,
      providers: [
        {
          provide: LAZY_STORE_TOKEN,
          useValue: stores
        },
        {
          provide: LAZY_STORE_OPTIONS_TOKEN,
          useValue: options
        }
      ]
    };
  }

  constructor(
    private _factory: StoreFactory,
    private _stateStream: StateStream,
    store: Ngxs,
    select: SelectFactory,
    @Optional()
    @Inject(STORE_TOKEN)
    stores: any[],
    @Optional()
    @Inject(LAZY_STORE_TOKEN)
    lazyStores: any[],
    pluginManager: PluginManager
  ) {
    this.initStores(stores);
    this.initStores(lazyStores);
    select.connect(store);
    pluginManager.register();
  }

  initStores(stores) {
    if (stores) {
      const init = {};
      this._factory.add(stores).forEach((meta: any) => {
        init[meta.name] = meta.defaults;
      });
      const cur = this._stateStream.getValue();
      this._stateStream.next({
        ...cur,
        ...init
      });
    }
  }
}
