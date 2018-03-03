import { Injectable, Injector } from '@angular/core';

@Injectable()
export class PluginManager {
  plugins: any = [];

  constructor(private _injector: Injector) {}

  use(plugins: any[]) {
    for (const plugin of plugins) {
      if (plugin.prototype.handle) {
        const inst = this._injector.get(plugin, new plugin());
        this.plugins.push(inst.handle);
      } else {
        this.plugins.push(plugin);
      }
    }
  }
}
