import { InjectionToken } from '@angular/core';

export const STORAGE_ENGINE = new InjectionToken<StorageEngine>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'STORAGE_ENGINE' : ''
);

export interface StorageEngine {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
}
