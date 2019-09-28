import { InjectionToken } from '@angular/core';

/**
 * @see only use to access internal {@link StateContextFactory} in plugins
 */
export const NGXS_INTERNAL_CONTEXT_FACTORY: InjectionToken<string> = new InjectionToken(
  'NGXS_INTERNAL_CONTEXT_FACTORY'
);

/**
 * @see only use to access internal {@link StateFactory} in plugins
 */
export const NGXS_INTERNAL_FACTORY: InjectionToken<string> = new InjectionToken(
  'NGXS_INTERNAL_FACTORY'
);
