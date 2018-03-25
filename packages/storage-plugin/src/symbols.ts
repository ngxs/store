import { InjectionToken } from '@angular/core';

export enum StorageOption {
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
   * Serailizer for the object before its pushed into the engine.
   */
  serialize?(obj: any);

  /**
   * Deserializer for the object before its pulled out of the engine.
   */
  deserialize?(obj: any);
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
