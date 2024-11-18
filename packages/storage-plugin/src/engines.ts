import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageEngine } from '@ngxs/storage-plugin/internals';

declare const ngDevMode: boolean;

export const LOCAL_STORAGE_ENGINE = /* @__PURE__ */ new InjectionToken<StorageEngine | null>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'LOCAL_STORAGE_ENGINE' : '',
  {
    providedIn: 'root',
    factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null)
  }
);

export const SESSION_STORAGE_ENGINE = /* @__PURE__ */ new InjectionToken<StorageEngine | null>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'SESSION_STORAGE_ENGINE' : '',
  {
    providedIn: 'root',
    factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? sessionStorage : null)
  }
);
