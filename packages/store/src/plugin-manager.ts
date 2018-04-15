import { Injectable, Optional, SkipSelf, Inject } from '@angular/core';
import { NgxsPluginFn, NGXS_PLUGINS, NgxsPlugin } from './symbols';

/**
 * Plugin manager class
 * @ignore
 */
@Injectable()
export class PluginManager {
  plugins: NgxsPluginFn[] = [];

  constructor(
    @Optional()
    @SkipSelf()
    private _parentManager: PluginManager,
    @Inject(NGXS_PLUGINS)
    @Optional()
    private _plugins: NgxsPlugin[]
  ) {
    this.register();
  }

  private register() {
    if (!this._plugins) {
      return;
    }

    this.plugins = this._plugins.map(plugin => {
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
