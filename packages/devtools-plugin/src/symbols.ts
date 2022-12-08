import { InjectionToken } from '@angular/core';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface NgxsDevtoolsExtension {
  init(state: any): void;
  send(action: any, state?: any): void;
  subscribe(fn: (message: NgxsDevtoolsAction) => void): VoidFunction;
}

export interface NgxsDevtoolsAction {
  type: string;
  payload: any;
  state: any;
  id: number;
  source: string;
}

export interface NgxsDevtoolsOptions {
  /**
   * The name of the extension
   */
  name?: string;

  /**
   * Whether the dev tools is enabled or note. Useful for setting during production.
   */
  disabled?: boolean;

  /**
   * Max number of entiries to keep.
   */
  maxAge?: number;

  /**
   * If more than one action is dispatched in the indicated interval, all new actions will be collected
   * and sent at once. It is the joint between performance and speed. When set to 0, all actions will be
   * sent instantly. Set it to a higher value when experiencing perf issues (also maxAge to a lower value).
   * Default is 500 ms.
   */
  latency?: number;

  /**
   * string or array of strings as regex - actions types to be hidden in the monitors (while passed to the reducers).
   * If actionsWhitelist specified, actionsBlacklist is ignored.
   */
  actionsBlacklist?: string | string[];

  /**
   * string or array of strings as regex - actions types to be shown in the monitors (while passed to the reducers).
   * If actionsWhitelist specified, actionsBlacklist is ignored.
   */
  actionsWhitelist?: string | string[];


  /**
   * called for every action before sending, takes state and action object, and returns true in case it allows
   * sending the current data to the monitor. Use it as a more advanced version of
   * actionsBlacklist/actionsWhitelist parameters
   */
  predicate?: (state: any, action: any) => boolean;

  /**
   * Reformat actions before sending to dev tools
   */
  actionSanitizer?: (action: any) => void;

  /**
   * Reformat state before sending to devtools
   */
  stateSanitizer?: (state: any) => void;
}

export const NGXS_DEVTOOLS_OPTIONS = new InjectionToken('NGXS_DEVTOOLS_OPTIONS');
