import { InjectionToken } from '@angular/core';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface NgxsDevtoolsExtension {
  init(state);
  send(action: string, state?: any);
  subscribe(fn: (message: string) => void);
}

export interface NgxsDevtoolsOptions {
  disabled: boolean;
}

export const NGXS_DEVTOOLS_OPTIONS = new InjectionToken('NGXS_DEVTOOLS_OPTIONS');
