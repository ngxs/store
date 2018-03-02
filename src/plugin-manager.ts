import { Injectable, Injector, Optional, Inject } from '@angular/core';
import { STORE_OPTIONS_TOKEN, LAZY_STORE_OPTIONS_TOKEN, NgxsOptions } from './symbols';

@Injectable()
export class PluginManager {
  plugins: any = [];

  constructor(
    @Optional()
    @Inject(STORE_OPTIONS_TOKEN)
    private _storeOptions: NgxsOptions,
    @Optional()
    @Inject(LAZY_STORE_OPTIONS_TOKEN)
    private _featureStoreOptions: NgxsOptions,
    private _injector: Injector
  ) {}

  register() {
    const plugins = [
      ...(this._storeOptions && this._storeOptions.plugins ? this._storeOptions.plugins : []),
      ...(this._featureStoreOptions && this._featureStoreOptions.plugins ? this._featureStoreOptions.plugins : [])
    ];

    for (const plugin of plugins) {
      const p: any = plugin;
      this.plugins.push(this._injector.get(plugin, new p()));
    }
  }
}
