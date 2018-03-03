import { InjectionToken } from '@angular/core';

export const STORE_TOKEN = new InjectionToken<any>('STORE_TOKEN');
export const STORE_OPTIONS_TOKEN = new InjectionToken<any>('STORE_OPTIONS_TOKEN');
export const LAZY_STORE_TOKEN = new InjectionToken<any>('LAZY_STORE_TOKEN');
export const LAZY_STORE_OPTIONS_TOKEN = new InjectionToken<any>('LAZY_STORE_OPTIONS_TOKEN');
export const META_KEY = 'NGXS_META';

export interface NgxsOptions {
  plugins: NgxsPlugin[];
}

export interface NgxsPlugin {
  handle(state, mutation, next): any;
}
