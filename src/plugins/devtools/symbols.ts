import { InjectionToken } from '@angular/core';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface DevtoolsExtension {
  init(state);
  send(action: string, state?: any);
  subscribe(fn: (message: string) => void);
}

export interface DevtoolsOptions {
  disabled: boolean;
}

export const DEVTOOLS_OPTIONS = new InjectionToken('DEVTOOLS_OPTIONS');
