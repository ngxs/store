import { isPlatformServer } from '@angular/common';
import { StateClass } from '@ngxs/store/internals';
import { ActionType, InitState, StateToken, UpdateState } from '@ngxs/store';

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
    if (typeof token === 'string') {
      return token;
    } else if (token instanceof StateToken) {
      return token.getName();
    }

    const options = (token as any)[META_OPTIONS_KEY];
    return options.name;
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

export function checkIsInitAction(action: ActionType | InitState | UpdateState): boolean {
  return action instanceof InitState || action instanceof UpdateState;
}

export function isNotNull(val: any): boolean {
  return val !== 'undefined' && typeof val !== 'undefined' && val !== null;
}

export interface States {
  [key: string]: any;
}

export const DATA_ERROR_CODE = {
  DESERIALIZE:
    'Error occurred while deserializing the store value, falling back to empty object.',
  SERIALIZE: 'Error occurred while serializing the store value, value not updated.'
};
