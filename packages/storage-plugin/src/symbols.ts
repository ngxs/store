import { InjectionToken } from '@angular/core';

export const enum StorageOption {
  LocalStorage,
  SessionStorage
}

export interface NgxsStoragePluginOptions {
  /**
   * Key for the state slice to store in the storage engine.
   */
  key?: string | string[] | undefined;

  /**
   * Storage engine to use. Deaults to localStorage but can provide
   *
   * sessionStorage or custom implementation of the StorageEngine interface
   */
  storage?: StorageOption;

  /**
   * Migration strategies.
   */
  migrations?: {
    /**
     * Version to key off.
     */
    version: number | string;

    /**
     * Method to migrate the previous state.
     */
    migrate: (state: any) => any;

    /**
     * Key to migrate.
     */
    key?: string;

    /**
     * Key for the version. Defaults to 'version'.
     */
    versionKey?: string;
  }[];

  /**
   * Serializer for the object before its pushed into the engine.
   *
   * @param obj {any} value of currently processed state slice
   * @param key {string} key of currently processed state slice
   */
  serialize?(obj: any, key?: any);

  /**
   * Deserializer for the object before its pulled out of the engine.
   *
   * @param obj {any} value of currently processed state slice
   * @param key {string} key of currently processed state slice
   * @param state {any} previous value of currently processed state slice
   */
  deserialize?(obj: any, key?: any, state?: any);
}

export const NGXS_STORAGE_PLUGIN_OPTIONS = new InjectionToken('NGXS_STORAGE_PLUGIN_OPTION');

export const STORAGE_ENGINE = new InjectionToken('STORAGE_ENGINE');

export interface StorageEngine {
  readonly length: number;

  getItem(key): any;
  setItem(key, val): void;
  removeItem(key): void;
  clear(): void;
  key(val: number): string;
}
