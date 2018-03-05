import { Injectable, Injector } from '@angular/core';
import { NgxsPluginFn } from './symbols';

@Injectable()
export class PluginManager {
  plugins: NgxsPluginFn[] = [];

  constructor(private _injector: Injector) {}

  use(plugins: any[]) {
    for (const plugin of plugins) {
      if (plugin.prototype.handle) {
        const inst = this._injector.get(plugin);
        this.plugins.push(inst.handle.bind(inst));
      } else {
        this.plugins.push(plugin);
      }
    }
  }
}
