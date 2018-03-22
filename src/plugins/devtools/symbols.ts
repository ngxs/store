import { InjectionToken } from '@angular/core';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface NgxsDevtoolsExtension {
  init(state);
  send(action: string, state?: any);
  subscribe(fn: (message: NgxsDevtoolsAction) => void);
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
   * Whether the dev tools is enabled or note. Useful for setting during production.
   */
  disabled?: boolean;

  /**
   * Max number of entiries to keep.
   */
  maxAge?: number;

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
