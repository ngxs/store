import {
  assertInInjectionContext,
  createEnvironmentInjector,
  DestroyRef,
  EnvironmentInjector,
  inject,
  InjectionToken,
  type Type
} from '@angular/core';
import type { NgxsPlugin, NgxsPluginFn } from '@ngxs/store/plugins';

import { PluginManager } from './plugin-manager';
import { withNgxsPlugin } from './standalone-features/plugin';

const REGISTERED_PLUGINS = /* @__PURE__ */ new InjectionToken('', {
  factory: () => {
    const plugins = new Set();
    inject(DestroyRef).onDestroy(() => plugins.clear());
    return plugins;
  }
});

/**
 * Dynamically registers an NGXS plugin in the current injection context.
 *
 * This function allows you to register NGXS plugins at runtime, creating an isolated
 * environment injector for the plugin. The plugin is automatically cleaned up when
 * the injection context is destroyed. In development mode, the function validates
 * that the same plugin is not registered multiple times.
 *
 * @param plugin - The NGXS plugin to register. Can be either a class type implementing
 *                 `NgxsPlugin` or a plugin function (`NgxsPluginFn`).
 *
 * @throws {Error} Throws an error if called outside of an injection context.
 * @throws {Error} In development mode, throws an error if the plugin has already been registered.
 *
 * @remarks
 * - Must be called within an injection context (e.g., constructor, field initializer, or `runInInjectionContext`).
 * - The created environment injector is automatically destroyed when the parent context is destroyed.
 * - Duplicate plugin registration is only checked in development mode for performance reasons.
 *
 * @example
 * ```ts
 * // Register a plugin class
 * import { MyThirdPartyIntegrationPlugin } from './plugins/third-party.plugin';
 *
 * @Component({
 *   selector: 'app-root',
 *   template: '...'
 * })
 * export class AppComponent {
 *   constructor() {
 *     registerNgxsPlugin(MyThirdPartyIntegrationPlugin);
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // Register a plugin function
 * import { myThirdPartyIntegrationPluginFn } from './plugins/third-party.plugin';
 *
 * @Component({
 *   selector: 'app-feature',
 *   template: '...'
 * })
 * export class FeatureComponent {
 *   constructor() {
 *     registerNgxsPlugin(myThirdPartyIntegrationPluginFn);
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // Register conditionally based on environment
 * import { MyDevtoolsPlugin } from './plugins/devtools.plugin';
 *
 * @Component({
 *   selector: 'app-root',
 *   template: '...'
 * })
 * export class AppComponent {
 *   constructor() {
 *     if (ngDevMode) {
 *       registerNgxsPlugin(MyDevtoolsPlugin);
 *     }
 *   }
 * }
 * ```
 */
export function registerNgxsPlugin(plugin: Type<NgxsPlugin> | NgxsPluginFn) {
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    assertInInjectionContext(registerNgxsPlugin);

    const registeredPlugins = inject(REGISTERED_PLUGINS);
    if (registeredPlugins.has(plugin)) {
      throw new Error(
        'Plugin has already been registered. Each plugin should only be registered once to avoid unexpected behavior.'
      );
    }
    registeredPlugins.add(plugin);
  }

  // Create a new environment injector with the plugin configuration.
  // This isolates the plugin's dependencies and providers.
  const injector = createEnvironmentInjector(
    [PluginManager, withNgxsPlugin(plugin)],
    inject(EnvironmentInjector)
  );

  // Ensure the created injector is destroyed when the injection context is destroyed.
  // This prevents memory leaks and ensures proper cleanup.
  inject(DestroyRef).onDestroy(() => injector.destroy());
}
