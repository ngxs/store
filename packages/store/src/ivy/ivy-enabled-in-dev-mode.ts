import { isDevMode } from '@angular/core';
import { ReplaySubject } from 'rxjs';

export const ivyEnabledInDevMode$ = new ReplaySubject<boolean>(1);

/**
 * Ivy exposes helper functions to the global `window.ng` object.
 * Those functions are `getComponent, getContext,
 * getListeners, getViewComponent, getHostElement, getInjector,
 * getRootComponents, getDirectives, getDebugNode`
 * Previously, old view engine exposed `window.ng.coreTokens` and
 * `window.ng.probe` if an application was in development/production.
 * Ivy doesn't expose these functions in production. Developers will be able
 * to see warnings in both JIT/AOT modes, but only if an application
 * is in development.
 */
export function setIvyEnabledInDevMode(): void {
  try {
    // `try-catch` will also handle server-side rendering, as
    // `window is not defined` will not be thrown.
    const ng = (window as any).ng;
    const _viewEngineEnabled = !!ng.probe && !!ng.coreTokens;
    const _ivyEnabledInDevMode = !_viewEngineEnabled && isDevMode();
    ivyEnabledInDevMode$.next(_ivyEnabledInDevMode);
  } catch {
    ivyEnabledInDevMode$.next(false);
  } finally {
    ivyEnabledInDevMode$.complete();
  }
}
