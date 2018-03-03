import { InjectionToken } from '@angular/core';

export const STORE_TOKEN = new InjectionToken<any>('STORE_TOKEN');
export const STORE_OPTIONS_TOKEN = new InjectionToken<any>('STORE_OPTIONS_TOKEN');
export const LAZY_STORE_TOKEN = new InjectionToken<any>('LAZY_STORE_TOKEN');
export const LAZY_STORE_OPTIONS_TOKEN = new InjectionToken<any>('LAZY_STORE_OPTIONS_TOKEN');
export const META_KEY = 'NGXS_META';

export type NgxsPluginConstructor = new (...args: any[]) => NgxsPlugin;

export interface NgxsOptions {
  plugins: NgxsPluginConstructor[];
}

export interface NgxsPlugin {
  handle(state, mutation, next): any;
}
