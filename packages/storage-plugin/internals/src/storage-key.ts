import { InjectionToken, Type } from '@angular/core';
import { StateToken } from '@ngxs/store';
import { ɵMETA_OPTIONS_KEY, ɵStateClass } from '@ngxs/store/internals';

import { StorageEngine } from './symbols';

/** This enables the user to provide a storage engine per individual key. */
export interface KeyWithExplicitEngine {
  key: string | ɵStateClass | StateToken<any>;
  engine: Type<StorageEngine> | InjectionToken<StorageEngine>;
}

/** Determines whether the provided key has the following structure. */
export function ɵisKeyWithExplicitEngine(key: any): key is KeyWithExplicitEngine {
  return key != null && !!key.engine;
}

/**
 * This tuples all of the possible types allowed in the `key` property.
 * This is not exposed publicly and used internally only.
 */
export type StorageKey = string | ɵStateClass | StateToken<any> | KeyWithExplicitEngine;

export function ɵextractStringKey(storageKey: StorageKey): string {
  // Extract the actual key out of the `{ key, engine }` structure.
  if (ɵisKeyWithExplicitEngine(storageKey)) {
    storageKey = storageKey.key;
  }

  // Given the `storageKey` is a class, for instance, `AuthState`.
  // We should retrieve its metadata and the `name` property.
  // The `name` property might be a string (state name) or a state token.
  if (storageKey.hasOwnProperty(ɵMETA_OPTIONS_KEY)) {
    storageKey = (storageKey as any)[ɵMETA_OPTIONS_KEY].name;
  }

  return storageKey instanceof StateToken ? storageKey.getName() : <string>storageKey;
}
