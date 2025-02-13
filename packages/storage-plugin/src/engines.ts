import { InjectionToken } from '@angular/core';
import { StorageEngine } from '@ngxs/storage-plugin/internals';

declare const ngDevMode: boolean;
declare const ngServerMode: boolean;

export const LOCAL_STORAGE_ENGINE = /* @__PURE__ */ new InjectionToken<StorageEngine | null>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'LOCAL_STORAGE_ENGINE' : '',
  {
    providedIn: 'root',
    factory: () => (typeof ngServerMode !== 'undefined' && ngServerMode ? null : localStorage)
  }
);

export const SESSION_STORAGE_ENGINE = /* @__PURE__ */ new InjectionToken<StorageEngine | null>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'SESSION_STORAGE_ENGINE' : '',
  {
    providedIn: 'root',
    factory: () =>
      typeof ngServerMode !== 'undefined' && ngServerMode ? null : sessionStorage
  }
);
