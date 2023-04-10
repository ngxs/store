import { InjectionToken } from '@angular/core';

import { StorageEngine } from './symbols';

export const LOCAL_STORAGE_ENGINE = new InjectionToken<StorageEngine>('LOCAL_STORAGE_ENGINE', {
  providedIn: 'root',
  factory: () => localStorage
});

export const SESSION_STORAGE_ENGINE = new InjectionToken<StorageEngine>(
  'SESSION_STORAGE_ENGINE',
  {
    providedIn: 'root',
    factory: () => sessionStorage
  }
);
