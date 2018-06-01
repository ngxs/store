import { Injectable, Optional, SkipSelf, Inject } from '@angular/core';
import { NgxsPluginFn, NGXS_PLUGINS, NgxsPlugin, NgxsStateOperationsWrapperFn } from './symbols';

/**
 * Plugin manager class
 * @ignore
 */
@Injectable()
export class PluginManager {
  plugins: NgxsPluginFn[] = [];
  stateOperationsPlugins: NgxsStateOperationsWrapperFn[] = [];

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

    this.stateOperationsPlugins = this._plugins
      .map(plugin => {
        if (plugin.wrapStateOperations) {
          return plugin.wrapStateOperations.bind(plugin);
        } else {
          return null;
        }
      })
      .filter(fn => fn);

    if (this._parentManager) {
      this._parentManager.plugins.push(...this.plugins);
      this._parentManager.stateOperationsPlugins.push(...this.stateOperationsPlugins);
    }
  }
}
