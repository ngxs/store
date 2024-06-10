import { Injectable, Injector, inject } from '@angular/core';
import {
  STORAGE_ENGINE,
  StorageEngine,
  StorageKey,
  ɵextractStringKey,
  ɵisKeyWithExplicitEngine,
  ɵNGXS_STORAGE_PLUGIN_OPTIONS
} from '@ngxs/storage-plugin/internals';

interface KeyWithEngine {
  key: string;
  engine: StorageEngine;
}

@Injectable({ providedIn: 'root' })
export class ɵNgxsStoragePluginKeysManager {
  /** Store keys separately in a set so we're able to check if the key already exists. */
  private readonly _keys = new Set<string>();

  private readonly _injector = inject(Injector);

  private readonly _keysWithEngines: KeyWithEngine[] = [];

  constructor() {
    const { keys } = inject(ɵNGXS_STORAGE_PLUGIN_OPTIONS);
    this.addKeys(keys);
  }

  getKeysWithEngines() {
    // Spread to prevent external code from directly modifying the internal state.
    return [...this._keysWithEngines];
  }

  addKeys(storageKeys: StorageKey[]): void {
    for (const storageKey of storageKeys) {
      const key = ɵextractStringKey(storageKey);

      // The user may call `withStorageFeature` with the same state multiple times.
      // Let's prevent duplicating state names in the `keysWithEngines` list.
      // Please note that calling provideStates multiple times with the same state is
      // acceptable behavior. This may occur because the state could be necessary at the
      // feature level, and different parts of the application might require its registration.
      // Consequently, `withStorageFeature` may also be called multiple times.
      if (this._keys.has(key)) {
        continue;
      }

      this._keys.add(key);

      const engine = ɵisKeyWithExplicitEngine(storageKey)
        ? this._injector.get(storageKey.engine)
        : this._injector.get(STORAGE_ENGINE);

      this._keysWithEngines.push({ key, engine });
    }
  }
}
