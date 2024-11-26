import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  Type,
  inject,
  makeEnvironmentProviders
} from '@angular/core';
import { NGXS_PLUGINS, NgxsPlugin, NgxsPluginFn, ɵisPluginClass } from '@ngxs/store/plugins';

import { PluginManager } from '../plugin-manager';

/**
 * This function registers a custom global plugin for the state.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideStore(
 *       [CountriesState],
 *       withNgxsPlugin(LogoutPlugin)
 *     )
 *   ]
 * });
 * ```
 */
export function withNgxsPlugin(plugin: Type<NgxsPlugin> | NgxsPluginFn): EnvironmentProviders {
  return makeEnvironmentProviders([
    ɵisPluginClass(plugin)
      ? { provide: NGXS_PLUGINS, useClass: plugin, multi: true }
      : { provide: NGXS_PLUGINS, useValue: plugin, multi: true },
    // We should inject the `PluginManager` to retrieve `NGXS_PLUGINS` and
    // register those plugins. The plugin can be added from inside the child
    // route, so the plugin manager should be re-injected.
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(PluginManager),
      multi: true
    }
  ]);
}
