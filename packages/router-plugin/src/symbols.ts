import { InjectionToken } from '@angular/core';

export const enum NavigationActionTiming {
  PreActivation = 1,
  PostActivation = 2
}

export interface NgxsRouterPluginOptions {
  navigationActionTiming?: NavigationActionTiming;
}

export const USER_OPTIONS = new InjectionToken<NgxsRouterPluginOptions | undefined>(
  'USER_OPTIONS',
  { providedIn: 'root', factory: () => undefined }
);

export const NGXS_ROUTER_PLUGIN_OPTIONS = new InjectionToken<NgxsRouterPluginOptions>(
  'NGXS_ROUTER_PLUGIN_OPTIONS',
  { providedIn: 'root', factory: () => ({}) }
);

export function createRouterPluginOptions(
  options: NgxsRouterPluginOptions | undefined
): NgxsRouterPluginOptions {
  return {
    navigationActionTiming:
      (options && options.navigationActionTiming) || NavigationActionTiming.PreActivation
  };
}
