import { NgModule, ModuleWithProviders, Optional, Inject } from '@angular/core';
import { STORE_TOKEN, LAZY_STORE_TOKEN, STORE_OPTIONS_TOKEN, LAZY_STORE_OPTIONS_TOKEN, NgxsOptions } from './symbols';
import { StoreFactory } from './factory';
import { EventStream } from './event-stream';
import { Ngxs } from './ngxs';
import { SelectFactory } from './select';
import { StateStream } from './state-stream';
import { PluginManager } from './plugin-manager';
import { InitStore } from './events/init';
import { ReduxDevtoolsPlugin } from './plugins/redux-devtools';

@NgModule({
  providers: [StoreFactory, EventStream, Ngxs, StateStream, SelectFactory, PluginManager, ReduxDevtoolsPlugin]
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
        },
        ReduxDevtoolsPlugin
      ]
    };
  }

  static forFeature(stores: any[], options?: NgxsOptions): ModuleWithProviders {
    return {
      ngModule: NgxsModule,
      providers: [
        {
          provide: LAZY_STORE_TOKEN,
          useValue: stores,
          multi: true
        },
        {
          provide: LAZY_STORE_OPTIONS_TOKEN,
          useValue: options,
          multi: true
        }
      ]
    };
  }

  constructor(
    private _factory: StoreFactory,
    private _stateStream: StateStream,
    @Optional()
    @Inject(STORE_OPTIONS_TOKEN)
    private _storeOptions: NgxsOptions,
    @Optional()
    @Inject(LAZY_STORE_OPTIONS_TOKEN)
    private _featureStoreOptions: NgxsOptions,
    private _pluginManager: PluginManager,
    store: Ngxs,
    select: SelectFactory,
    @Optional()
    @Inject(STORE_TOKEN)
    stores: any[],
    @Optional()
    @Inject(LAZY_STORE_TOKEN)
    lazyStores: any[]
  ) {
    select.connect(store);
    this.registerPlugins();
    this.initStores(stores);
    this.initStores(lazyStores);
    store.dispatch(new InitStore());
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

  registerPlugins() {
    const rootPlugins = this._storeOptions && this._storeOptions.plugins ? this._storeOptions.plugins : [];

    const featurePlugins =
      this._featureStoreOptions && this._featureStoreOptions.plugins ? this._featureStoreOptions.plugins : [];

    this._pluginManager.use([...rootPlugins, ...featurePlugins]);
  }
}
