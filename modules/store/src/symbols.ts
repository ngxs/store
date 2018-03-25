import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export const ROOT_STATE_TOKEN = new InjectionToken<any>('ROOT_STATE_TOKEN');
export const FEATURE_STATE_TOKEN = new InjectionToken<any>('FEATURE_STATE_TOKEN');
export const META_KEY = 'NGXS_META';

export type NgxsPluginConstructor = new (...args: any[]) => NgxsPlugin;

export interface NgxsOptions {
  plugins: Array<NgxsPluginConstructor | NgxsPluginFn>;
}

export interface StateContext<T> {
  /**
   * Get the current state.
   */
  getState(): T;

  /**
   * Reset the state to a new value.
   */
  setState(val: T);

  /**
   * Patch the existing state with the provided value.
   */
  patchState(val: Partial<T>);

  /**
   * Dispatch a new action and return the dispatched observable.
   */
  dispatch(actions: any | any[]): Observable<void>;
}

export type NgxsNextPluginFn = (state: any, mutation: any) => any;

export interface NgxsPlugin {
  /**
   * Handle the state/action before its submitted to the state handlers.
   */
  handle(state: any, action: any, next: NgxsNextPluginFn): any;
}

export const NGXS_PLUGINS = new InjectionToken('NGXS_PLUGINS');

export type NgxsPluginFn = (state: any, mutation: any, next: NgxsNextPluginFn) => any;

export interface StoreOptions<T> {
  /**
   * Name of the state. Required.
   */
  name: string;

  /**
   * Default values for the state. If not provided, uses empty object.
   */
  defaults?: T;

  /**
   * Sub states for the given state.
   */
  children?: any[];
}
