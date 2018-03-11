import { InjectionToken } from '@angular/core';

export enum StorageStrategy {
  localstorage,
  sessionStorage
}

export interface LocalStoragePluginOptions {
  key?: string | string[] | undefined;
  strategy?: StorageStrategy;
  serialize?(obj: any);
  deserialize?(obj: any);
}

export const LOCAL_STORAGE_PLUGIN_OPTIONS = new InjectionToken('LOCAL_STORAGE_PLUGIN_OPTION');
