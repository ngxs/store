import { isPlatformServer } from '@angular/common';

import { StorageOption, StorageEngine, NgxsStoragePluginOptions } from './symbols';

/**
 * The following key is used to store the entire serialized
 * state when there's no specific state provided.
 */
export const DEFAULT_STATE_KEY = '@@STATE';

export function storageOptionsFactory(
  options: NgxsStoragePluginOptions | undefined
): NgxsStoragePluginOptions {
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
    return localStorage;
  } else if (options.storage === StorageOption.SessionStorage) {
    return sessionStorage;
  }

  return null;
}

export function getStorageKey(key: string, options?: NgxsStoragePluginOptions): string {
  // Prepends the `namespace` option to any key if it's been provided by a user.
  // So `@@STATE` becomes `my-app:@@STATE`.
  return options && options.namespace ? `${options.namespace}:${key}` : key;
}
