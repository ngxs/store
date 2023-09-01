import { InjectionToken } from '@angular/core';

import { StorageKey } from './internals/storage-key';

export const enum StorageOption {
  LocalStorage,
  SessionStorage
}

export interface NgxsStoragePluginOptions {
  /**
   * Key for the state slice to store in the storage engine.
   */
  key?: undefined | StorageKey | StorageKey[];

  /**
   * The namespace is used to prefix the key for the state slice. This is
   * necessary when running micro frontend applications which use storage plugin.
   * The namespace will eliminate the conflict between keys that might overlap.
   */
  namespace?: string;

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
   * Serailizer for the object before its pushed into the engine.
   */
  serialize?(obj: any): string;

  /**
   * Deserializer for the object before its pulled out of the engine.
   */
  deserialize?(obj: any): any;

  /**
   * Method to alter object before serialization.
   */
  beforeSerialize?(obj: any, key: string): any;

  /**
   * Method to alter object after deserialization.
   */
  afterDeserialize?(obj: any, key: string): any;
}

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export const NGXS_STORAGE_PLUGIN_OPTIONS = new InjectionToken(
  NG_DEV_MODE ? 'NGXS_STORAGE_PLUGIN_OPTIONS' : ''
);

export const STORAGE_ENGINE = new InjectionToken<StorageEngine>(
  NG_DEV_MODE ? 'STORAGE_ENGINE' : ''
);

export interface StorageEngine {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
}
