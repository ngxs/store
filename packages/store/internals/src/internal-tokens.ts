import { InjectionToken } from '@angular/core';

/**
 * @see StateContextFactory as it's referenced by this token to be accessed by plugins internally
 */
export const NGXS_STATE_CONTEXT_FACTORY: InjectionToken<unknown> = new InjectionToken(
  'Internals.StateContextFactory'
);

/**
 * @see StateFactory as it's referenced by this token to be accessed by plugins internally
 */
export const NGXS_STATE_FACTORY: InjectionToken<unknown> = new InjectionToken(
  'Internals.StateFactory'
);
