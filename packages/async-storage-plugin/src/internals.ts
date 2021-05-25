import { isPlatformServer } from '@angular/common';
import { StateToken } from '@ngxs/store';
import * as localForage from 'localforage';

import {
  AsyncStorageEngine,
  NgxsAsyncStoragePluginOptions,
  NgxsAsyncStorageLocations,
  AsyncEngineOption
} from './symbols';

export type StateClass<T = any> = new (...args: any[]) => T;

/**
 * If the `key` option is not provided then the below constant
 * will be used as a default key
 */
export const DEFAULT_STATE_KEY = '@@STATE';

/**
 * This key is used to retrieve static metadatas on state classes.
 * This constant is taken from the core codebase
 */
const META_OPTIONS_KEY = 'NGXS_OPTIONS_META';

/**
 * Internal type definition for the `key` option provided
 * in the `forRoot` method when importing module
 */
export type StorageKey =
  | string
  | StateClass
  | StateToken<any>
  | (string | StateClass | StateToken<any>)[];

const getStateKey = (token: string | StateClass | StateToken<any>) => {
  if (token.hasOwnProperty(META_OPTIONS_KEY)) {
    token = (token as any)[META_OPTIONS_KEY].name;
  }

  return token instanceof StateToken ? token.getName() : (token as string);
};

export function storageOptionsFactory(
  options: NgxsAsyncStoragePluginOptions | undefined,
  platformId: string
): ResolvedPluginOptions {
  const emptyOptions: ResolvedPluginOptions = {
    storages: []
  };

  const usedKeys: string[] = [];

  if (isPlatformServer(platformId)) return emptyOptions;

  if (options && options.storages && options.storages.length > 0) {
    const resolvedStorages: ResolvedPluginEngines[] = options.storages.map(storage => {
      const keysArray = Array.isArray(storage.keys) ? storage.keys : [storage.keys];
      const keys = keysArray.map(key => getStateKey(key));
      usedKeys.push(...keys);

      let method: AsyncStorageEngine;
      if (storage.storage === AsyncEngineOption.LocalStorage)
        method = new BrowserStorage({ engine: 'local' });
      else if (storage.storage === AsyncEngineOption.SessionStorage)
        method = new BrowserStorage({ engine: 'session' });
      else if (storage.storage === AsyncEngineOption.IndexedDB)
        method = new IndexedDBStorage(storage.indexeddb || {});
      else method = new storage.storage();

      const { serialize, deserialize, afterDeserialize, beforeSerialize } = storage;

      const browserStorageSerializers: ResolvedPluginEngines['serializers'] = {
        serialize: serialize || JSON.stringify,
        deserialize: deserialize || JSON.parse,
        afterDeserialize,
        beforeSerialize
      };

      return {
        keys,
        engine: method,
        migrations: storage.migrations,
        serializers:
          method instanceof BrowserStorage
            ? browserStorageSerializers
            : {
                serialize,
                deserialize,
                afterDeserialize,
                beforeSerialize
              }
      };
    });

    const usedKeysSet = Array.from(new Set(usedKeys));
    if (usedKeys.length > usedKeysSet.length)
      throw new Error(
        'Must only specify a state key in one entry. Cannot store to multiple engines at the same time.'
      );

    return {
      storages: resolvedStorages
    };
  }

  return emptyOptions;
}

export type Serializers = 'afterDeserialize' | 'beforeSerialize' | 'deserialize' | 'serialize';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ResolvedPluginEngines
  extends Omit<NgxsAsyncStorageLocations, 'keys' | 'indexeddb' | 'storage' | Serializers> {
  keys: string[];
  serializers: Partial<Pick<NgxsAsyncStorageLocations, Serializers>>;
  engine: AsyncStorageEngine;
}

interface BrowserStorageEngineOptions {
  engine: 'local' | 'session';
}

class BrowserStorage implements AsyncStorageEngine {
  storage: typeof localStorage | typeof sessionStorage;

  constructor(options: BrowserStorageEngineOptions) {
    this.storage = options.engine === 'local' ? localStorage : sessionStorage;
  }

  get length() {
    return this.storage.length;
  }

  get(key: string) {
    return this.storage.getItem(key);
  }

  set(key: string, value: any) {
    return this.storage.setItem(key, value);
  }

  clear() {
    this.storage.clear();
  }

  remove(key: string) {
    this.storage.removeItem(key);
  }
}

class IndexedDBStorage implements AsyncStorageEngine {
  forage: LocalForage;

  constructor(options: LocalForageOptions) {
    this.forage = localForage.createInstance(options);
  }

  get length() {
    return this.forage.length();
  }

  get(key: string) {
    return this.forage.getItem(key);
  }

  set(key: string, value: any) {
    return this.forage.setItem(key, value);
  }

  clear() {
    this.forage.clear();
  }

  remove(key: string) {
    this.forage.removeItem(key);
  }
}

export interface ResolvedPluginOptions {
  storages: ResolvedPluginEngines[];
}
