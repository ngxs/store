let ivyEnabledInDevMode: boolean | null = null;

/**
 * Ivy exposes helper functions to the global `window.ng` object.
 * Those functions are `getComponent, getContext,
 * getListeners, getViewComponent, getHostElement, getInjector,
 * getRootComponents, getDirectives, getDebugNode, markDirty`
 * Previously, old view engine exposed `window.ng.coreTokens` and
 * `window.ng.probe` in development/production modes. Ivy doesn't
 * expose these functions in production mode. Developers will be able
 * to see warnings in both JIT/AOT modes, but only in development mode.
 */
export async function ivyEnabledInDevMode$(): Promise<boolean> {
  if (ivyEnabledInDevMode !== null) {
    return ivyEnabledInDevMode;
  }

  // Unfortunately, NGXS code is running before Ivy exposes those helper functions
  // without `Promise.resolve().then(...)` `window.ng` will always equal `undefined`
  await Promise.resolve();

  try {
    // `try-catch` will also handle server-side rendering, as
    // `window is not defined` will not be thrown.
    const ng = (window as any).ng;
    return (ivyEnabledInDevMode =
      !!ng && typeof ng.getComponent === 'function' && typeof ng.markDirty === 'function');
  } catch {
    return false;
  }
}
