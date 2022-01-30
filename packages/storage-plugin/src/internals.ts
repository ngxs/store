import { isPlatformServer } from '@angular/common';
import { StateClass } from '@ngxs/store/internals';
import { StateToken } from '@ngxs/store';

import { StorageOption, StorageEngine, NgxsStoragePluginOptions } from './symbols';

/**
 * If the `key` option is not provided then the below constant
 * will be used as a default key
 */
export const DEFAULT_STATE_KEY = '@@STATE';

/**
 * Internal type definition for the `key` option provided
 * in the `forRoot` method when importing module
 */
export type StorageKey =
  | string
  | StateClass
  | StateToken<any>
  | (string | StateClass | StateToken<any>)[];

/**
 * This key is used to retrieve static metadatas on state classes.
 * This constant is taken from the core codebase
 */
const META_OPTIONS_KEY = 'NGXS_OPTIONS_META';

function transformKeyOption(key: StorageKey): string[] {
  if (!Array.isArray(key)) {
    key = [key];
  }

  return key.map((token: string | StateClass | StateToken<any>) => {
    // If it has the `NGXS_OPTIONS_META` key then it means the developer
    // has provided state class like `key: [AuthState]`.
    if (token.hasOwnProperty(META_OPTIONS_KEY)) {
      // The `name` property will be an actual state name or a `StateToken`.
      token = (token as any)[META_OPTIONS_KEY].name;
    }

    return token instanceof StateToken ? token.getName() : (token as string);
  });
}

export function storageOptionsFactory(
  options: NgxsStoragePluginOptions | undefined
): NgxsStoragePluginOptions {
  if (options !== undefined && options.key) {
    options.key = transformKeyOption(options.key);
  }

  return {
    key: [DEFAULT_STATE_KEY],
    storage: StorageOption.LocalStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    beforeSerialize: obj => obj,
    afterDeserialize: obj => obj,
    ...options
  };
}

export function engineFactory(
  options: NgxsStoragePluginOptions,
  platformId: string
): StorageEngine | null {
  if (isPlatformServer(platformId)) {
    return null;
  }

  if (options.storage === StorageOption.LocalStorage) {
    try {
      const verifyKey = `${DEFAULT_STATE_KEY}-VERIFY`;
      localStorage.setItem(verifyKey, '1');
      localStorage.removeItem(verifyKey);
      return localStorage;
    } catch (e) {
      console.warn('LocalStorage is not available, using a fallback implementation!', e);
      return fallbackStorage();
    }
  } else if (options.storage === StorageOption.SessionStorage) {
    try {
      const verifyKey = `${DEFAULT_STATE_KEY}-VERIFY`;
      sessionStorage.setItem(verifyKey, '1');
      sessionStorage.removeItem(verifyKey);
      return sessionStorage;
    } catch (e) {
      console.warn('SessionStorage is not available, using a fallback implementation!', e);
      return fallbackStorage();
    }
  }

  return null;
}

export function fallbackStorage(): Storage {
  let storage: { [x: string]: any } = {};

  return {
    setItem: (key, value) => {
      storage[key] = value || '';
    },
    getItem: key => {
      return key in storage ? storage[key] : null;
    },
    removeItem: key => {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: i => {
      const keys = Object.keys(storage);
      return keys[i] || null;
    },
    clear: () => {
      storage = {};
    }
  };
}
