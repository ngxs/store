import { StateToken } from '@ngxs/store';

import { StorageKey } from './internals';

const _keys = new Set<string>([]);

export function getKeys(): string[] {
  return Array.from(_keys);
}

export function clearKeys(): void {
  _keys.clear();
}

export function addKeys(keys: StorageKey | StorageKey[]): void {
  for (const storageKey of Array.isArray(keys) ? keys : [keys]) {
    _keys.add(extractStateName(storageKey));
  }
}

/**
 * This key is used to retrieve static metadatas on state classes.
 * This constant is taken from the core codebase
 */
const META_OPTIONS_KEY = 'NGXS_OPTIONS_META';

function extractStateName(storageKey: StorageKey): string {
  // If it has the `NGXS_OPTIONS_META` key then it means the developer
  // has provided state class like `key: [AuthState]`.
  if (storageKey.hasOwnProperty(META_OPTIONS_KEY)) {
    // The `name` property will be an actual state name or a `StateToken`.
    storageKey = (storageKey as any)[META_OPTIONS_KEY].name;
  }

  return storageKey instanceof StateToken ? storageKey.getName() : (storageKey as string);
}
