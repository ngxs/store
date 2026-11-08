import {
  DestroyRef,
  EnvironmentProviders,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Store } from '@ngxs/store';
import {
  StorageKey,
  ɵALL_STATES_PERSISTED,
  ɵUSER_OPTIONS,
  ɵextractStringKey
} from '@ngxs/storage-plugin/internals';

import {
  NgxsStorageTransferStateOptions,
  ɵSTORAGE_TRANSFER_STATE,
  ɵSTORAGE_TRANSFER_STATE_OPTIONS,
  ɵStorageTransferState
} from '../transfer-state';

declare const ngDevMode: boolean;
declare const ngServerMode: boolean;

/**
 * Gives a first value to the saved keys that the server can build, with
 * Angular `TransferState`. On the server we write our state parts into the
 * transfer data. On the client we read them one time, before the storage
 * engine. So the browser starts with the same state as the server HTML, and
 * not with an old value from `localStorage`.
 *
 * Give this as a feature to `withNgxsStoragePlugin()`. It uses the
 * `namespace`, `beforeSerialize` and `afterDeserialize` of the plugin, so do
 * not provide it alone. Its `keys` must also be keys of the plugin.
 *
 * The transfer data sits inside the HTML and everybody can read it. This is
 * why you write `keys` yourself, and why `beforeSerialize` is the place to
 * remove secrets.
 *
 * @example
 * ```ts
 * // The server sends `auth`, and the client also saves it in the storage.
 * provideStore(
 *   [AuthState],
 *   withNgxsStoragePlugin(
 *     { keys: ['auth'] },
 *     withNgxsStorageTransferState({ keys: ['auth'] })
 *   )
 * );
 * ```
 *
 * @example
 * ```ts
 * // With `persist: false` the server sends `website`, but the client never
 * // reads or writes the browser storage for it.
 * provideStore(
 *   [WebsiteState],
 *   withNgxsStoragePlugin(
 *     { keys: ['website'] },
 *     withNgxsStorageTransferState({ keys: ['website'], persist: false })
 *   )
 * );
 * ```
 *
 * @experimental This API is experimental and may change in any release.
 */
export function withNgxsStorageTransferState(
  options: NgxsStorageTransferStateOptions
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ɵSTORAGE_TRANSFER_STATE_OPTIONS, useValue: options },
    ɵStorageTransferState,
    { provide: ɵSTORAGE_TRANSFER_STATE, useExisting: ɵStorageTransferState },
    provideEnvironmentInitializer(() => {
      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        validateOptions(options);
      }

      const isServer =
        (typeof ngServerMode !== 'undefined' && ngServerMode) ||
        isPlatformServer(inject(PLATFORM_ID));

      if (!isServer) return;

      const transferState = inject(ɵSTORAGE_TRANSFER_STATE)!;
      const store = inject(Store);

      // `subscribe` gives the state now, so an app with no actions also
      // works. Every next change writes again, so the last state before
      // Angular serializes is the one we send.
      const subscription = store.subscribe(state => transferState.capture(state));
      inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    })
  ]);
}

function validateOptions(options: NgxsStorageTransferStateOptions): void {
  if (inject(ɵALL_STATES_PERSISTED)) {
    if (options.persist === false) {
      console.error(
        'The NGXS storage plugin cannot apply `persist: false` while the root `keys` ' +
          'option is set to `*`. All states are stored in a single serialized value, ' +
          'so individual slices cannot be excluded from it.'
      );
    }

    // The `*` option saves all states, so no key can be missing here.
    return;
  }

  // We look at the user options, not at the keys manager. Feature keys come
  // later, so the manager would say they are missing.
  const rootKeys = (inject(ɵUSER_OPTIONS).keys as StorageKey[]).map(ɵextractStringKey);

  for (const key of options.keys) {
    if (rootKeys.includes(key)) continue;

    console.error(
      `The NGXS storage plugin is not persisting the "${key}" key, so the transfer ` +
        'state value for it will never be read. Add it to the root `keys` option.'
    );
  }
}
