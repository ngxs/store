import { InjectionToken, makeEnvironmentProviders } from '@angular/core';

const NG_DEV_MODE = typeof ngDevMode !== 'undefined' && ngDevMode;

/**
 * InjectionToken that registers preboot functions (called before the root initializer).
 */
export const NGXS_PREBOOT_FNS = new InjectionToken<VoidFunction[]>(
  NG_DEV_MODE ? 'NGXS_PREBOOT_FNS' : ''
);

/**
 * This function registers a preboot function which will be called before the root
 * store initializer is run, but after all of the NGXS features are provided and
 * available for injection. This is useful for registering action stream listeners
 * before any action is dispatched.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideStore(
 *       [CountriesState],
 *       withNgxsPreboot(() => {
 *         const actions$ = inject(Actions);
 *         actions$.subscribe(ctx => console.log(ctx));
 *       })
 *     )
 *   ]
 * });
 * ```
 */
export function withNgxsPreboot(prebootFn: VoidFunction) {
  return makeEnvironmentProviders([
    { provide: NGXS_PREBOOT_FNS, multi: true, useValue: prebootFn }
  ]);
}
