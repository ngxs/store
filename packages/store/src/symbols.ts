import { Injectable, InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs';

import { PlainObject, StateClass } from '@ngxs/store/internals';
import { SharedSelectorOptions, Callback } from './internal/internals';
import { NgxsExecutionStrategy } from './execution/symbols';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './execution/dispatch-outside-zone-ngxs-execution-strategy';
import { StateToken } from './state-token/state-token';

export const ROOT_STATE_TOKEN = new InjectionToken<any>('ROOT_STATE_TOKEN');
export const FEATURE_STATE_TOKEN = new InjectionToken<any>('FEATURE_STATE_TOKEN');
export const NGXS_PLUGINS = new InjectionToken('NGXS_PLUGINS');
export const NG_TEST_MODE = new InjectionToken<Callback<boolean>>('NG_TEST_MODE');
export const NG_DEV_MODE = new InjectionToken<Callback<boolean>>('NG_DEV_MODE');

export const META_KEY = 'NGXS_META';
export const META_OPTIONS_KEY = 'NGXS_OPTIONS_META';
export const SELECTOR_META_KEY = 'NGXS_SELECTOR_META';

export type NgxsLifeCycle = Partial<NgxsOnChanges> &
  Partial<NgxsOnInit> &
  Partial<NgxsAfterBootstrap>;

export type NgxsPluginFn = (state: any, mutation: any, next: NgxsNextPluginFn) => any;

/**
 * The NGXS config settings.
 */
@Injectable()
export class NgxsConfig {
  /**
   * Run in development mode. This will add additional debugging features:
   * - Object.freeze on the state and actions to guarantee immutability
   * (default: false)
   */
  developmentMode: boolean;
  compatibility: {
    /**
     * Support a strict Content Security Policy.
     * This will circumvent some optimisations that violate a strict CSP through the use of `new Function(...)`.
     * (default: false)
     */
    strictContentSecurityPolicy: boolean;
  };
  /**
   * Determines the execution context to perform async operations inside. An implementation can be
   * provided to override the default behaviour where the async operations are run
   * outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone.
   * These observable behaviours are from:
   *   `@Select(...)`, `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`
   * Every `zone.run` causes Angular to run change detection on the whole tree (`app.tick()`) so of your
   * application doesn't rely on zone.js running change detection then you can switch to the
   * `NoopNgxsExecutionStrategy` that doesn't interact with zones.
   * (default: null)
   */
  executionStrategy: Type<NgxsExecutionStrategy>;
  /**
   * Defining the default state before module initialization
   * This is convenient if we need to create a define our own set of states.
   * @deprecated will be removed after v4
   * (default: {})
   */
  defaultsState: PlainObject = {};
  /**
   * Defining shared selector options
   */
  selectorOptions: SharedSelectorOptions = {
    injectContainerState: true, // TODO: default is true in v3, will change in v4
    suppressErrors: true // TODO: default is true in v3, will change in v4
  };

  constructor() {
    this.compatibility = {
      strictContentSecurityPolicy: false
    };
    this.executionStrategy = DispatchOutsideZoneNgxsExecutionStrategy;
  }
}

export type StateOperator<T> = (existing: Readonly<T>) => T;

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
  setState(val: T | StateOperator<T>): T;

  /**
   * Patch the existing state with the provided value.
   */
  patchState(val: Partial<T>): T;

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
  name: string | StateToken<T>;

  /**
   * Default values for the state. If not provided, uses empty object.
   */
  defaults?: T;

  /**
   * Sub states for the given state.
   */
  children?: StateClass[];
}

/**
 * Represents a basic change from a previous to a new value for a single state instance.
 * Passed as a value in a NgxsSimpleChanges object to the ngxsOnChanges hook.
 */
export class NgxsSimpleChange<T = any> {
  constructor(
    public readonly previousValue: T,
    public readonly currentValue: T,
    public readonly firstChange: boolean
  ) {}
}

/**
 * On init interface
 */
export interface NgxsOnInit {
  ngxsOnInit(ctx?: StateContext<any>): void | any;
}

/**
 * On change interface
 */
export interface NgxsOnChanges {
  ngxsOnChanges(change: NgxsSimpleChange): void;
}

/**
 * After bootstrap interface
 */
export interface NgxsAfterBootstrap {
  ngxsAfterBootstrap(ctx?: StateContext<any>): void;
}

export type NgxsModuleOptions = Partial<NgxsConfig>;
