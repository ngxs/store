import { isPlatformServer } from '@angular/common';
import {
  ɵDEFAULT_STATE_KEY,
  StorageOption,
  StorageEngine,
  NgxsStoragePluginOptions,
  ɵNgxsTransformedStoragePluginOptions
} from '@ngxs/storage-plugin/internals';

export function storageOptionsFactory(
  options: NgxsStoragePluginOptions
): ɵNgxsTransformedStoragePluginOptions {
  return {
    storage: StorageOption.LocalStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    beforeSerialize: obj => obj,
    afterDeserialize: obj => obj,
    ...options,
    keys: options.keys === '*' ? [ɵDEFAULT_STATE_KEY] : options.keys
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
  return options?.namespace ? `${options.namespace}:${key}` : key;
}
