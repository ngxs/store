import { InjectionToken, Injector } from '@angular/core';

import { exctractStringKey, isKeyWithExplicitEngine, StorageKey } from './storage-key';
import { NgxsStoragePluginOptions, StorageEngine, STORAGE_ENGINE } from '../symbols';

export interface FinalNgxsStoragePluginOptions extends NgxsStoragePluginOptions {
  keysWithEngines: {
    key: string;
    engine: StorageEngine;
  }[];
}

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export const FINAL_NGXS_STORAGE_PLUGIN_OPTIONS =
  new InjectionToken<FinalNgxsStoragePluginOptions>(
    NG_DEV_MODE ? 'FINAL_NGXS_STORAGE_PLUGIN_OPTIONS' : ''
  );

export function createFinalStoragePluginOptions(
  injector: Injector,
  options: NgxsStoragePluginOptions
): FinalNgxsStoragePluginOptions {
  const storageKeys: StorageKey[] = Array.isArray(options.key) ? options.key : [options.key!];

  const keysWithEngines = storageKeys.map((storageKey: StorageKey) => {
    const key = exctractStringKey(storageKey);
    const engine = isKeyWithExplicitEngine(storageKey)
      ? injector.get(storageKey.engine)
      : injector.get(STORAGE_ENGINE);
    return { key, engine };
  });

  return {
    ...options,
    keysWithEngines
  };
}
