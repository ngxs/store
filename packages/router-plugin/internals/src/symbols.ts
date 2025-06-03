import { InjectionToken } from '@angular/core';

declare const ngDevMode: boolean;

export enum NavigationActionTiming {
  PreActivation = 1,
  PostActivation = 2
}

export interface NgxsRouterPluginOptions {
  navigationActionTiming?: NavigationActionTiming;
}

export const ɵUSER_OPTIONS = new InjectionToken<NgxsRouterPluginOptions | undefined>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'USER_OPTIONS' : '',
  { providedIn: 'root', factory: () => undefined }
);

export const ɵNGXS_ROUTER_PLUGIN_OPTIONS = new InjectionToken<NgxsRouterPluginOptions>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_ROUTER_PLUGIN_OPTIONS' : '',
  { providedIn: 'root', factory: () => ({}) }
);

export function ɵcreateRouterPluginOptions(
  options: NgxsRouterPluginOptions | undefined
): NgxsRouterPluginOptions {
  return {
    navigationActionTiming:
      (options && options.navigationActionTiming) || NavigationActionTiming.PreActivation
  };
}
