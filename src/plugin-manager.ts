import { Injectable, Optional, SkipSelf, Inject } from '@angular/core';
import { NgxsPluginFn, NGXS_PLUGINS, NgxsPlugin } from './symbols';

@Injectable()
export class PluginManager {
  plugins: NgxsPluginFn[] = [];

  constructor(
    @Optional()
    @SkipSelf()
    private _parentManager: PluginManager,
    @Inject(NGXS_PLUGINS) private _plugins: NgxsPlugin[]
  ) {
    this.register();
  }

  private register() {
    this.plugins = this._plugins.filter(plugin => plugin).map(plugin => {
      if (plugin.handle) {
        return plugin.handle.bind(plugin);
      } else {
        return plugin;
      }
    });

    if (this._parentManager) {
      this._parentManager.plugins.push(...this.plugins);
    }
  }
}
