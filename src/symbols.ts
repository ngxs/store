import { InjectionToken } from '@angular/core';

export const STORE_TOKEN = new InjectionToken<any>('STORE_TOKEN');
export const STORE_OPTIONS_TOKEN = new InjectionToken<any>('STORE_OPTIONS_TOKEN');
export const LAZY_STORE_TOKEN = new InjectionToken<any>('LAZY_STORE_TOKEN');
export const LAZY_STORE_OPTIONS_TOKEN = new InjectionToken<any>('LAZY_STORE_OPTIONS_TOKEN');
export const META_KEY = 'NGXS_META';

export type NgxsPluginConstructor = new (...args: any[]) => NgxsPlugin;

export interface NgxsOptions {
  plugins: Array<NgxsPluginConstructor | NgxsPluginFn>;
}

export type NgxsNextPluginFn = (state: any, mutation: any) => any;

export interface NgxsPlugin {
  handle(state: any, mutation: any, next: NgxsNextPluginFn): any;
}

export type NgxsPluginFn = (state: any, mutation: any, next: NgxsNextPluginFn) => any;

export interface StoreOptions {
  name?: string;
  defaults?: any;
}
