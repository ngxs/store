import { InjectionToken } from '@angular/core';
import { StorageEngine } from '@ngxs/storage-plugin/internals';

declare const ngDevMode: boolean;
declare const ngServerMode: boolean;

export const LOCAL_STORAGE_ENGINE = /* @__PURE__ */ new InjectionToken<StorageEngine | null>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'LOCAL_STORAGE_ENGINE' : '',
  {
    // `ngServerMode` catches Angular SSR (Node has no `localStorage` at all), but some
    // pages also get rendered by crawlers/bots whose JS engines never define the global
    // either. Checking `typeof` first means we return `null` instead of crashing there too.
    factory: () =>
      typeof ngServerMode !== 'undefined' && ngServerMode
        ? null
        : typeof localStorage === 'undefined'
          ? null
          : localStorage
  }
);

export const SESSION_STORAGE_ENGINE = /* @__PURE__ */ new InjectionToken<StorageEngine | null>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'SESSION_STORAGE_ENGINE' : '',
  {
    // Same reasoning as LOCAL_STORAGE_ENGINE above: `ngServerMode` only covers Angular's
    // own SSR, so we still need to check the global exists before touching it.
    factory: () =>
      typeof ngServerMode !== 'undefined' && ngServerMode
        ? null
        : typeof sessionStorage === 'undefined'
          ? null
          : sessionStorage
  }
);
