import { InjectionToken, Injector } from '@angular/core';

import {
  STORAGE_ENGINE,
  StorageEngine,
  ɵNgxsTransformedStoragePluginOptions
} from './symbols';
import { StorageKey, ɵextractStringKey, ɵisKeyWithExplicitEngine } from './storage-key';

export interface ɵFinalNgxsStoragePluginOptions extends ɵNgxsTransformedStoragePluginOptions {
  keysWithEngines: {
    key: string;
    engine: StorageEngine;
  }[];
}

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export const ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS =
  new InjectionToken<ɵFinalNgxsStoragePluginOptions>(
    NG_DEV_MODE ? 'FINAL_NGXS_STORAGE_PLUGIN_OPTIONS' : ''
  );

export function ɵcreateFinalStoragePluginOptions(
  injector: Injector,
  options: ɵNgxsTransformedStoragePluginOptions
): ɵFinalNgxsStoragePluginOptions {
  const storageKeys = options.keys;

  const keysWithEngines = storageKeys.map((storageKey: StorageKey) => {
    const key = ɵextractStringKey(storageKey);
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
