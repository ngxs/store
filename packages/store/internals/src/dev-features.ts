import { InjectionToken } from '@angular/core';

import { ActionType } from './symbols';

export interface ɵNgxsDevelopmentOptions {
  warnOnNewReferenceWithIdenticalValue?: {
    isEqual: (a: unknown, b: unknown) => boolean;
  };
  // This allows setting only `true` because there's no reason to set `false`.
  // Developers may just skip importing the development module at all.
  warnOnUnhandledActions:
    | true
    | {
        ignore: ActionType[];
      };
  /**
   * Warns when two different action classes are declared with the same `type` string.
   * Since handlers are looked up by `type`, every handler registered for that type runs
   * whenever either action is dispatched, even though their payloads may differ.
   */
  warnOnDuplicateActionTypes?: boolean;
}

export const ɵNGXS_DEVELOPMENT_OPTIONS =
  /* @__PURE__ */ new InjectionToken<ɵNgxsDevelopmentOptions>(
    typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_DEVELOPMENT_OPTIONS' : '',
    {
      factory: () => ({ warnOnUnhandledActions: true })
    }
  );
