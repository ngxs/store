import {
  DestroyRef,
  EnvironmentProviders,
  NgZone,
  PLATFORM_ID,
  inject,
  provideEnvironmentInitializer
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Store } from '@ngxs/store';
import { setValue } from '@ngxs/store/plugins';
import {
  ɵDEFAULT_STATE_KEY,
  ɵNGXS_STORAGE_PLUGIN_OPTIONS
} from '@ngxs/storage-plugin/internals';

import { getStorageKey } from '../internals';
import { ɵNgxsStoragePluginKeysManager } from '../keys-manager';

/**
 * Keeps the store in sync across browser tabs/windows that share the same
 * `localStorage`/`sessionStorage` origin. When another tab writes to a
 * persisted key, this tab rehydrates that slice of state from the new value
 * instead of waiting for its own next write to storage.
 *
 * Pass this as a feature to `withNgxsStoragePlugin()`, e.g.
 * `withNgxsStoragePlugin({ keys: [...] }, withNgxsStorageSync())` — it relies
 * on the same key/engine registration, so it isn't meant to be provided on
 * its own.
 *
 * Only reacts to the native `StorageEvent`, which the browser fires only for
 * `localStorage`/`sessionStorage` — keys persisted through a custom
 * `StorageEngine` aren't covered, since there's no cross-tab notification
 * mechanism for the plugin to hook into for those.
 */
export function withNgxsStorageSync(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    if (
      (typeof ngServerMode !== 'undefined' && ngServerMode) ||
      isPlatformServer(inject(PLATFORM_ID))
    ) {
      return;
    }

    const store = inject(Store);
    const keysManager = inject(ɵNgxsStoragePluginKeysManager);
    const options = inject(ɵNGXS_STORAGE_PLUGIN_OPTIONS);

    const listener = (event: StorageEvent) => {
      // `event.key` is `null` when the change came from `Storage.clear()` —
      // not something we can attribute to a single persisted key, so skip it.
      if (event.key == null || event.newValue == null) {
        return;
      }

      for (const { key, engine } of keysManager.getKeysWithEngines()) {
        // Guard against `engine` being falsy, and only react to the two
        // built-in Web Storage engines — a custom engine's writes can't
        // have produced this native `StorageEvent` in the first place.
        if (!engine || engine !== event.storageArea) continue;
        if (getStorageKey(key, options) !== event.key) continue;

        let storedValue: any;
        try {
          const newVal = options.deserialize!(event.newValue);
          storedValue = options.afterDeserialize!(newVal, key);
        } catch {
          typeof ngDevMode !== 'undefined' &&
            ngDevMode &&
            console.error(
              `Error occurred while deserializing the ${event.key} value written by another tab, skipping sync: `,
              event.newValue
            );
          continue;
        }

        const currentState = store.snapshot();
        const nextState =
          key === ɵDEFAULT_STATE_KEY ? storedValue : setValue(currentState, key, storedValue);

        store.reset(nextState);
      }
    };

    // Registered outside Angular so that every "storage" event firing
    // doesn't schedule a needless change-detection pass on its own — this
    // matches how NGXS already runs dispatch itself outside the zone;
    // `Store.select`'s stream brings subscribers back inside the zone for
    // whatever actually changed.
    const ngZone = inject(NgZone);
    ngZone.runOutsideAngular(() => window.addEventListener('storage', listener));
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', listener));
  });
}
