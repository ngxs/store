import { EnvironmentProviders, Type, makeEnvironmentProviders } from '@angular/core';
import { NGXS_PLUGINS, NgxsPlugin } from '@ngxs/store/plugins';

/**
 * This function registers a custom global plugin for the state.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideStore(
 *       [CountriesState],
 *       withNgxsPlugin(logoutPlugin)
 *     )
 *   ]
 * });
 * ```
 */
export function withNgxsPlugin(plugin: Type<NgxsPlugin>): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: NGXS_PLUGINS, useClass: plugin, multi: true }]);
}
