import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageKey } from './internals';
import 'localforage';

export const enum AsyncEngineOption {
  LocalStorage,
  SessionStorage,
  IndexedDB
}

export type AsyncStorageOption = (new () => AsyncStorageEngine) | AsyncEngineOption;

export interface NgxsAsyncStorageMigrations {
  /**
   * Version to key off.
   */
  version: number | string;

  /**
   * Method to migrate the previous state.
   */
  migrate: (state: any) => any;

  /**
   * Key for the version. Defaults to 'version'.
   */
  versionKey?: string;

  /**
   * Key to migrate.
   */
  key?: string;
}

export interface NgxsAsyncStorageLocations {
  /**
   * Key for the state slice to store in the storage engine.
   */
  keys: StorageKey;
  /**
   * Storage engine to use. Deaults to indexedDB but can provide
   * sessionStorage, localStorage or custom implementation of an
   * observable, async or sync StorageEngine interface
   */
  storage: AsyncStorageOption;
  /**
   * If using indexed db as the storage type, set options
   * for the underlying local forage instance
   */
  indexeddb?: LocalForageOptions;
  /**
   * Migration strategies.
   */
  migrations?: NgxsAsyncStorageMigrations[];
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

export interface NgxsAsyncStoragePluginOptions {
  /**
   * Which slices of the state should be persisted into which state.
   * If not set, all will persist to indexed db.
   */
  storages?: NgxsAsyncStorageLocations[];
}

export const NGXS_ASYNC_STORAGE_PLUGIN_OPTIONS = new InjectionToken(
  'NGXS_ASYNC_STORAGE_PLUGIN_OPTIONS'
);

export type MaybeAsyncOrObservable<T> = Observable<T> | Promise<T> | T;

export interface AsyncStorageEngine {
  readonly length: MaybeAsyncOrObservable<number>;
  set(key: string, value: any): MaybeAsyncOrObservable<void>;
  get(key: string): MaybeAsyncOrObservable<any>;
  remove(key: string): MaybeAsyncOrObservable<void>;
  clear(): MaybeAsyncOrObservable<void>;
}
