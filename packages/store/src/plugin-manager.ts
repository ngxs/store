import { Injectable, Optional, SkipSelf, Inject } from '@angular/core';
import { NgxsPluginFn, NGXS_PLUGINS, NgxsPlugin } from './symbols';

/**
 * Plugin manager class
 * @ignore
 */
@Injectable()
export class PluginManager {
  public plugins: NgxsPluginFn[] = [];

  constructor(
    @Optional()
    @SkipSelf()
    private _parentManager: PluginManager,
    @Inject(NGXS_PLUGINS)
    @Optional()
    private _pluginHandlers: NgxsPlugin[]
  ) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.plugins = this.getPlugins();
    this.registerPluginInManager(this.plugins);
  }

  private registerPluginInManager(plugins: NgxsPluginFn[]): void {
    if (this._parentManager) {
      this._parentManager.plugins.push(...plugins);
    }
  }

  private getPlugins(): NgxsPluginFn[] {
    const handlers: NgxsPlugin[] = this._pluginHandlers || [];
    return handlers.map((plugin: NgxsPlugin) =>
      plugin.handle ? plugin.handle.bind(plugin) : plugin
    );
  }
}
