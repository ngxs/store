import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const ROOT_STATE_TOKEN = new InjectionToken<any>('ROOT_STATE_TOKEN');
export const FEATURE_STATE_TOKEN = new InjectionToken<any>('FEATURE_STATE_TOKEN');
export const META_KEY = 'NGXS_META';
export const SELECTOR_META_KEY = 'NGXS_SELECTOR_META';

export const NGXS_PLUGINS = new InjectionToken('NGXS_PLUGINS');
export type NgxsPluginConstructor = new (...args: any[]) => NgxsPlugin;
export type NgxsPluginFn = (state: any, mutation: any, next: NgxsNextPluginFn) => any;

/**
 * The NGXS config settings.
 */
export class NgxsConfig {
  /**
   * Run in development mode. This will add additional debugging features:
   * - Object.freeze on the state and actions to guarantee immutability
   * (default: false)
   */
  developmentMode: boolean;
}

/**
 * State context provided to the actions in the state.
 */
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
 * Options that can be provided to the store.
 */
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

/**
 * Actions that can be provided in a action decorator.
 */
export interface ActionOptions {
  /**
   * Cancel the previous uncompleted observable(s).
   */
  cancelUncompleted?: boolean;
}

/**
 * On init interface
 */
export interface NgxsOnInit {
  ngxsOnInit(ctx?: StateContext<any>): void | any;
}

export type NgxsLifeCycle = Partial<NgxsOnInit>;
