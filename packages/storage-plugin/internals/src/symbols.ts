import { InjectionToken, inject } from '@angular/core';

import { StorageKey } from './storage-key';

/**
 * The following key is used to store the entire serialized
 * state when no specific state is provided.
 */
export const ɵDEFAULT_STATE_KEY = '@@STATE';

declare const ngDevMode: boolean;

export enum StorageOption {
  LocalStorage,
  SessionStorage
}

export interface NgxsStoragePluginOptions {
  /**
   * Keys for the state slice to store in the storage engine.
   */
  keys: '*' | StorageKey[];

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

export interface ɵNgxsTransformedStoragePluginOptions extends NgxsStoragePluginOptions {
  keys: StorageKey[];
}

export const ɵUSER_OPTIONS = new InjectionToken<NgxsStoragePluginOptions>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'USER_OPTIONS' : ''
);

// Determines whether all states in the NGXS registry should be persisted or not.
export const ɵALL_STATES_PERSISTED = new InjectionToken<boolean>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'ALL_STATES_PERSISTED' : '',
  {
    providedIn: 'root',
    factory: () => inject(ɵUSER_OPTIONS).keys === '*'
  }
);

export const ɵNGXS_STORAGE_PLUGIN_OPTIONS =
  new InjectionToken<ɵNgxsTransformedStoragePluginOptions>(
    typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_STORAGE_PLUGIN_OPTIONS' : ''
  );

export const STORAGE_ENGINE = new InjectionToken<StorageEngine>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'STORAGE_ENGINE' : ''
);

export interface StorageEngine {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
}
