let _ivyEnabledInDevMode: boolean | null = null;

/**
 * Ivy exposes helper functions to the global `window.ng` object.
 * Those functions are `getComponent, getContext,
 * getListeners, getViewComponent, getHostElement, getInjector,
 * getRootComponents, getDirectives, getDebugNode, markDirty`
 * Previously, old view engine exposed `window.ng.coreTokens` and
 * `window.ng.probe` if an application was in development/production.
 * Ivy doesn't expose these functions in production. Developers will be able
 * to see warnings in both JIT/AOT modes, but only if an application
 * is in development.
 */
export async function ivyEnabledInDevMode(): Promise<boolean> {
  if (_ivyEnabledInDevMode !== null) {
    return _ivyEnabledInDevMode;
  }

  // Unfortunately, NGXS code is running before Ivy exposes those helper functions
  // without `Promise.resolve().then(...)` `window.ng` will always equal `undefined`
  await Promise.resolve();

  try {
    // `try-catch` will also handle server-side rendering, as
    // `window is not defined` will not be thrown.
    const ng = (window as any).ng;
    return (_ivyEnabledInDevMode =
      !!ng && typeof ng.getComponent === 'function' && typeof ng.markDirty === 'function');
  } catch {
    return false;
  }
}
