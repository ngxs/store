import { InjectionToken, Type } from '@angular/core';

declare const ngDevMode: boolean;

export type NgxsNextPluginFn = (state: any, action: any) => any;

export type NgxsPluginFn = (state: any, action: any, next: NgxsNextPluginFn) => any;

/**
 * Plugin interface
 */
export interface NgxsPlugin {
  /**
   * Handle the state/action before its submitted to the state handlers.
   */
  handle(state: any, action: any, next: NgxsNextPluginFn): any;
}

/**
 * A multi-provider token used to resolve to custom NGXS plugins provided
 * at the root and feature levels through the `{provide}` scheme.
 *
 * @deprecated from v18.0.0, use `withNgxsPlugin` instead.
 */
export const NGXS_PLUGINS = /* @__PURE__ */ new InjectionToken<NgxsPlugin[]>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_PLUGINS' : ''
);

export function ɵisPluginClass(
  plugin: Type<NgxsPlugin> | NgxsPluginFn
): plugin is Type<NgxsPlugin> {
  // Determines whether the provided value is a class rather than a function.
  // If it’s a class, its handle method should be defined on its prototype,
  // as plugins can be either classes or functions.
  return !!plugin.prototype.handle;
}
