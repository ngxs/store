import { InjectionToken } from '@angular/core';

export interface NgxsLocalStoragePluginOptions {
  key?: string | string[] | undefined;
  storage?: any;
  serialize?(obj: any);
  deserialize?(obj: any);
}

export const NGXS_LOCAL_STORAGE_PLUGIN_OPTIONS = new InjectionToken('NGXS_LOCAL_STORAGE_PLUGIN_OPTION');
