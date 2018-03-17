import { InjectionToken } from '@angular/core';

export interface LocalStoragePluginOptions {
  key?: string | string[] | undefined;
  storage?: any;
  serialize?(obj: any);
  deserialize?(obj: any);
}

export const LOCAL_STORAGE_PLUGIN_OPTIONS = new InjectionToken('LOCAL_STORAGE_PLUGIN_OPTION');
