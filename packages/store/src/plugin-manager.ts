import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
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

  private readonly _injector = inject(Injector);

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
    const injector = this._injector;
    return handlers.map((plugin: NgxsPlugin) => {
      // Class plugins get their deps from the constructor, so they don't need
      // an injection context when they run.
      if (plugin.handle) {
        return plugin.handle.bind(plugin) as NgxsPluginFn;
      }

      // Functional plugins can call `inject()` in their body, so run them in an
      // injection context. Doing it here, per plugin, instead of around the
      // whole chain means that with only class plugins (or none) the action
      // handler no longer runs in one - `inject()` in a handler belongs in the
      // state's field initializers or constructor instead.
      //
      // Caveat: a functional plugin that calls `next()` synchronously still
      // leaks its context into the handler, since the rest of the chain runs
      // inside this frame.
      const pluginFn = plugin as unknown as NgxsPluginFn;
      return ((state, action, next) =>
        runInInjectionContext(injector, () => pluginFn(state, action, next))) as NgxsPluginFn;
    });
  }
}
