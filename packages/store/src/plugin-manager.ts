import { Inject, Injectable, Optional, SkipSelf } from '@angular/core';
import { NGXS_PLUGINS, NgxsPlugin, NgxsPluginFn } from './symbols';

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

  private get rootPlugins(): NgxsPluginFn[] {
    return (this._parentManager && this._parentManager.plugins) || this.plugins;
  }

  private registerHandlers(): void {
    const pluginHandlers: NgxsPluginFn[] = this.getPluginHandlers();
    this.rootPlugins.push(...pluginHandlers);
  }

  private getPluginHandlers(): NgxsPluginFn[] {
    const handlers: NgxsPlugin[] = this._pluginHandlers || [];
    return handlers.map(
      (plugin: NgxsPlugin) =>
        (plugin.handle ? plugin.handle.bind(plugin) : plugin) as NgxsPluginFn
    );
  }
}
