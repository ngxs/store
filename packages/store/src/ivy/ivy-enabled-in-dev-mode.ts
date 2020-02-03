import { isDevMode } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

/**
 * Keep it as a single `const` variable since this `ReplaySubject`
 * will be private and accessible only within this file.
 */
const _ivyEnabledInDevMode$ = new ReplaySubject<boolean>(1);

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
    _ivyEnabledInDevMode$.next(_ivyEnabledInDevMode);
  } catch {
    _ivyEnabledInDevMode$.next(false);
  } finally {
    _ivyEnabledInDevMode$.complete();
  }
}

export function ivyEnabledInDevMode(): Observable<boolean> {
  return _ivyEnabledInDevMode$.asObservable();
}
