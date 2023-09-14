import { InjectionToken, Injector } from '@angular/core';

import { NgxsStoragePluginOptions, STORAGE_ENGINE, StorageEngine } from './symbols';
import { StorageKey, ɵexctractStringKey, ɵisKeyWithExplicitEngine } from './storage-key';

export interface ɵFinalNgxsStoragePluginOptions extends NgxsStoragePluginOptions {
  keysWithEngines: {
    key: string;
    engine: StorageEngine;
  }[];
}

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export const ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS = new InjectionToken<unknown>(
  NG_DEV_MODE ? 'FINAL_NGXS_STORAGE_PLUGIN_OPTIONS' : ''
);

export function ɵcreateFinalStoragePluginOptions(
  injector: Injector,
  options: NgxsStoragePluginOptions
): ɵFinalNgxsStoragePluginOptions {
  const storageKeys: StorageKey[] = Array.isArray(options.key) ? options.key : [options.key!];

  const keysWithEngines = storageKeys.map((storageKey: StorageKey) => {
    const key = ɵexctractStringKey(storageKey);
    const engine = ɵisKeyWithExplicitEngine(storageKey)
      ? injector.get(storageKey.engine)
      : injector.get(STORAGE_ENGINE);
    return { key, engine };
  });

  return {
    ...options,
    keysWithEngines
  };
}
