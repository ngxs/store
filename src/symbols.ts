import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export const STORE_TOKEN = new InjectionToken<any>('STORE_TOKEN');
export const STORE_OPTIONS_TOKEN = new InjectionToken<any>('STORE_OPTIONS_TOKEN');
export const META_KEY = 'NGXS_META';

export type NgxsPluginConstructor = new (...args: any[]) => NgxsPlugin;

export interface NgxsOptions {
  plugins: Array<NgxsPluginConstructor | NgxsPluginFn>;
}

export interface StateContext<T> {
  getState(): T;
  setState(val: T);
  dispatch(actions: any | any[]): Observable<void>;
}

export type NgxsNextPluginFn = (state: any, mutation: any) => any;

export interface NgxsPlugin {
  handle(state: any, mutation: any, next: NgxsNextPluginFn): any;
}

export const NGXS_PLUGINS = new InjectionToken('NGXS_PLUGINS');

export type NgxsPluginFn = (state: any, mutation: any, next: NgxsNextPluginFn) => any;

export interface StoreOptions<T> {
  name?: string;
  defaults?: T;
  children?: any[];
}
