import { InjectionToken } from '@angular/core';

import { ActionType } from '../actions/symbols';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export interface NgxsDevelopmentOptions {
  // This allows setting only `true` because there's no reason to set `false`.
  // Developers may just skip importing the development module at all.
  warnOnUnhandledActions:
    | true
    | {
        ignore: ActionType[];
      };
}

export const NGXS_DEVELOPMENT_OPTIONS = new InjectionToken<NgxsDevelopmentOptions>(
  NG_DEV_MODE ? 'NGXS_DEVELOPMENT_OPTIONS' : '',
  {
    providedIn: 'root',
    factory: () => ({ warnOnUnhandledActions: true })
  }
);
