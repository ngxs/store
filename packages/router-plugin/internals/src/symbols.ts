import { InjectionToken } from '@angular/core';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode !== 'undefined' && ngDevMode;

export const enum NavigationActionTiming {
  PreActivation = 1,
  PostActivation = 2
}

export interface NgxsRouterPluginOptions {
  navigationActionTiming?: NavigationActionTiming;
}

export const ɵUSER_OPTIONS = new InjectionToken<NgxsRouterPluginOptions | undefined>(
  NG_DEV_MODE ? 'USER_OPTIONS' : '',
  { providedIn: 'root', factory: () => undefined }
);

export const ɵNGXS_ROUTER_PLUGIN_OPTIONS = new InjectionToken<NgxsRouterPluginOptions>(
  NG_DEV_MODE ? 'NGXS_ROUTER_PLUGIN_OPTIONS' : '',
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
