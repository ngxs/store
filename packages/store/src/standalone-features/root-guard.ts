import { inject, InjectionToken } from '@angular/core';

export const ROOT_STORE_GUARD = /* @__PURE__ */ new InjectionToken('ROOT_STORE_GUARD', {
  providedIn: 'root',
  factory: () => ({ initialized: false })
});

export function assertRootStoreNotInitialized(): void {
  const rootStoreGuard = inject(ROOT_STORE_GUARD);
  if (rootStoreGuard.initialized) {
    throw new Error('provideStore() should only be called once.');
  }
  rootStoreGuard.initialized = true;
}
