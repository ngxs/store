import { InjectionToken } from '@angular/core';

export interface NgxsLocalStoragePluginOptions {
  /**
   * Key for the state slice to store in the storage engine.
   */
  key?: string | string[] | undefined;

  /**
   * Storage engine to use. Deaults to localStorage but can provide
   * sessionStorage or anything that implements those interfaces.
   */
  storage?: any;

  /**
   * Serailizer for the object before its pushed into the engine.
   */
  serialize?(obj: any);

  /**
   * Deserializer for the object before its pulled out of the engine.
   */
  deserialize?(obj: any);
}

export const NGXS_LOCAL_STORAGE_PLUGIN_OPTIONS = new InjectionToken('NGXS_LOCAL_STORAGE_PLUGIN_OPTION');
