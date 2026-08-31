import {
  EnvironmentProviders,
  Type,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer
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
    // Force `PluginManager` to be created so it reads `NGXS_PLUGINS` and
    // registers these plugins. Plugins can also come from a child route, so
    // re-inject it there.
    provideEnvironmentInitializer(() => inject(PluginManager))
  ]);
}
