import {
  ApplicationRef,
  assertInInjectionContext,
  createEnvironmentInjector,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  InjectionToken
} from '@angular/core';

interface DefaultExport<T> {
  default: T;
}

function isWrappedDefaultExport<T>(value: T | DefaultExport<T>): value is DefaultExport<T> {
  return value && typeof value === 'object' && 'default' in value;
}

function maybeUnwrapDefaultExport<T>(input: T | DefaultExport<T>): T {
  return isWrappedDefaultExport(input) ? input['default'] : input;
}

const REGISTERED_PROVIDERS = new InjectionToken<Set<EnvironmentProviders>>('', {
  providedIn: 'root',
  factory: () => {
    const registeredProviders = new Set<EnvironmentProviders>();
    inject(ApplicationRef).onDestroy(() => registeredProviders.clear());
    return registeredProviders;
  }
});

/**
 * This function serves as a utility to lazy-load providers at the injection
 * context level — for example, at the route level. If the feature state needs
 * to be provided in more than one place, it might be indirectly included in
 * the main bundle, which we want to avoid. This function can be used at the
 * guard level to lazy-load the state provider before resolvers run and the
 * component is initialized:
 *
 * ```ts
 * const routes = [
 *   {
 *     path: 'home',
 *     loadComponent: () => import(...),
 *     canActivate: [
 *       lazyProvider(async () => (await import('path-to-state-library')).invoicesStateProvider)
 *     ]
 *   }
 * ];
 * ```
 *
 * Where `invoicesStateProvider` is the following:
 *
 * ```ts
 * // path-to-state-library/index.ts
 *
 * export const invoicesStateProvider = provideStates([InvoicesState]);
 * ```
 */
export function lazyProvider(
  factory: () => Promise<EnvironmentProviders | DefaultExport<EnvironmentProviders>>
) {
  return async () => {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      assertInInjectionContext(lazyProvider);
    }

    const appRef = inject(ApplicationRef);
    const parentInjector = inject(EnvironmentInjector);
    const registeredProviders = inject(REGISTERED_PROVIDERS);

    const provider = maybeUnwrapDefaultExport(await factory());

    if (registeredProviders.has(provider)) {
      return true;
    }

    registeredProviders.add(provider);
    const injector = createEnvironmentInjector([provider], parentInjector);
    appRef.onDestroy(() => injector.destroy());
    return true;
  };
}
