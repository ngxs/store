import { inject, Injectable } from '@angular/core';
import { NGXS_PLUGINS, NgxsPlugin, NgxsPluginFn } from '@ngxs/store/plugins';

@Injectable({ providedIn: 'root' })
export class PluginManager {
  readonly plugins: NgxsPluginFn[] = [];

  private readonly _parentManager = inject(PluginManager, {
    optional: true,
    skipSelf: true
  });

  private readonly _pluginHandlers = inject<NgxsPlugin[]>(NGXS_PLUGINS, {
    optional: true
  });

  constructor() {
    this.registerHandlers();
  }

  private get _rootPlugins(): NgxsPluginFn[] {
    return this._parentManager?.plugins || this.plugins;
  }

  private registerHandlers(): void {
    const pluginHandlers: NgxsPluginFn[] = this.getPluginHandlers();
    this._rootPlugins.push(...pluginHandlers);
  }

  private getPluginHandlers(): NgxsPluginFn[] {
    const handlers: NgxsPlugin[] = this._pluginHandlers || [];
    return handlers.map(
      (plugin: NgxsPlugin) =>
        (plugin.handle ? plugin.handle.bind(plugin) : plugin) as NgxsPluginFn
    );
  }
}
