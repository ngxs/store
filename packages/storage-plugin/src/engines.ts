import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageEngine } from '@ngxs/storage-plugin/internals';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export const LOCAL_STORAGE_ENGINE = new InjectionToken<StorageEngine | null>(
  NG_DEV_MODE ? 'LOCAL_STORAGE_ENGINE' : '',
  {
    providedIn: 'root',
    factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null)
  }
);

export const SESSION_STORAGE_ENGINE = new InjectionToken<StorageEngine | null>(
  NG_DEV_MODE ? 'SESSION_STORAGE_ENGINE' : '',
  {
    providedIn: 'root',
    factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? sessionStorage : null)
  }
);
