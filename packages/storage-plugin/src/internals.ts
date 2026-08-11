import {
  ɵDEFAULT_STATE_KEY,
  StorageOption,
  StorageEngine,
  NgxsStoragePluginOptions,
  ɵNgxsTransformedStoragePluginOptions
} from '@ngxs/storage-plugin/internals';

declare const ngServerMode: boolean;

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

export function engineFactory(options: NgxsStoragePluginOptions): StorageEngine | null {
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return null;
  }

  // `ngServerMode` only tells us we're not on Angular's own SSR. Some pages are also
  // rendered by crawlers/bots running JS engines that never define these globals at
  // all, so referencing them directly would throw a ReferenceError instead of just
  // leaving storage disabled. Users can't opt out of this factory, so it needs to be
  // defensive on their behalf.
  if (options.storage === StorageOption.LocalStorage) {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } else if (options.storage === StorageOption.SessionStorage) {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }

  return null;
}

export function getStorageKey(key: string, options?: NgxsStoragePluginOptions): string {
  // Prepends the `namespace` option to any key if it's been provided by a user.
  // So `@@STATE` becomes `my-app:@@STATE`.
  return options?.namespace ? `${options.namespace}:${key}` : key;
}
