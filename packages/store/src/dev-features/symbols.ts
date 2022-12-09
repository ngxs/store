import { InjectionToken } from '@angular/core';

import { ActionType } from '../actions/symbols';

export interface NgxsDevelopmentOptions {
  warnOnUnhandledActions: {
    ignore: ActionType[];
  };
}

export const NGXS_DEVELOPMENT_OPTIONS = new InjectionToken<NgxsDevelopmentOptions>(
  'NGXS_DEVELOPMENT_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({
      warnOnUnhandledActions: { ignore: [] }
    })
  }
);
