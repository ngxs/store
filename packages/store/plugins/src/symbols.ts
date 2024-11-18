import { InjectionToken } from '@angular/core';

declare const ngDevMode: boolean;

// The injection token is used to resolve to custom NGXS plugins provided
// at the root level through either `{provide}` scheme or `withNgxsPlugin`.
export const NGXS_PLUGINS = new InjectionToken(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_PLUGINS' : ''
);

export type NgxsPluginFn = (state: any, mutation: any, next: NgxsNextPluginFn) => any;

export type NgxsNextPluginFn = (state: any, mutation: any) => any;

/**
 * Plugin interface
 */
export interface NgxsPlugin {
  /**
   * Handle the state/action before its submitted to the state handlers.
   */
  handle(state: any, action: any, next: NgxsNextPluginFn): any;
}
