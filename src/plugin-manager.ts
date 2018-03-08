import { Injectable, Injector, Optional, SkipSelf } from '@angular/core';
import { NgxsPluginFn } from './symbols';

@Injectable()
export class PluginManager {
  plugins: NgxsPluginFn[] = [];

  constructor(
    @Optional()
    @SkipSelf()
    private _parentManager: PluginManager,
    private _injector: Injector
  ) {}

  use(plugins: any[]) {
    const mappedPlugins = [];

    for (const plugin of plugins) {
      if (plugin.prototype.handle) {
        const inst = this._injector.get(plugin);
        mappedPlugins.push(inst.handle.bind(inst));
      } else {
        mappedPlugins.push(plugin);
      }
    }

    const globalPlugins = this._parentManager ? this._parentManager.plugins : this.plugins;

    globalPlugins.push(...mappedPlugins);
  }
}
