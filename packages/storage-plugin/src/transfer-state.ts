import {
  DestroyRef,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { getValue } from '@ngxs/store/plugins';
import { ɵNGXS_STORAGE_PLUGIN_OPTIONS } from '@ngxs/storage-plugin/internals';

import { getStorageKey } from './internals';

declare const ngDevMode: boolean;
declare const ngServerMode: boolean;

/**
 * Options for `withNgxsStorageTransferState()`.
 *
 * @example
 * ```ts
 * // Send `auth` to the client and also save it in storage.
 * withNgxsStorageTransferState({ keys: ['auth'] });
 * ```
 *
 * @example
 * ```ts
 * // Send `website` and `pages` without using browser storage.
 * withNgxsStorageTransferState({ keys: ['website', 'pages'], persist: false });
 * ```
 */
export interface NgxsStorageTransferStateOptions {
  /**
   * The keys to send through `TransferState`.
   * Each key must be saved by the plugin.
   * You must list each key. You cannot use `'*'`.
   */
  keys: string[];

  /**
   * Also save sent values in the storage engine.
   * The default is `true`.
   *
   * When `false`, values are only added to NGXS state.
   * Browser storage is not read or changed for these keys.
   */
  persist?: boolean;
}

export const ɵSTORAGE_TRANSFER_STATE_OPTIONS =
  new InjectionToken<NgxsStorageTransferStateOptions>(
    typeof ngDevMode !== 'undefined' && ngDevMode ? 'STORAGE_TRANSFER_STATE_OPTIONS' : ''
  );

/**
 * The plugin always provides this token.
 * The default value is `null` because many apps do not use this feature.
 */
export const ɵSTORAGE_TRANSFER_STATE = new InjectionToken<ɵStorageTransferState | null>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'STORAGE_TRANSFER_STATE' : '',
  { factory: () => null }
);

@Injectable()
export class ɵStorageTransferState {
  private _transferState = inject(TransferState);
  private _pluginOptions = inject(ɵNGXS_STORAGE_PLUGIN_OPTIONS);
  private _options = inject(ɵSTORAGE_TRANSFER_STATE_OPTIONS);

  private _isServer =
    (typeof ngServerMode !== 'undefined' && ngServerMode) ||
    isPlatformServer(inject(PLATFORM_ID));

  private _taken = new Set<string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this._taken.clear());
  }

  covers(key: string): boolean {
    return this._options.keys.includes(key);
  }

  coveredKeys(): string[] {
    return this._options.keys;
  }

  persists(key: string): boolean {
    // A key we do not know is saved like before. Without this check,
    // `persist: false` would stop saving for all keys.
    if (!this.covers(key)) return true;
    return this._options.persist !== false;
  }

  /**
   * Gets the value for `key` one time and then removes it.
   * Returns `undefined` when there is no value.
   *
   * It is important to get the value only one time.
   * A later `UpdateState` from a lazy state must not add the value
   * back after the store has already changed it.
   */
  take(key: string): unknown | undefined {
    if (this._isServer || !this.covers(key) || this._taken.has(key)) {
      return undefined;
    }

    const stateKey = this._stateKeyFor(key);
    if (!this._transferState.hasKey(stateKey)) {
      return undefined;
    }

    this._taken.add(key);
    return this._transferState.get(stateKey, null);
  }

  /**
   * Puts our keys from `state` into `TransferState`. We call this only on the
   * server, when `ngServerMode` is truthy.
   */
  capture(state: unknown): void {
    for (const key of this._options.keys) {
      const value = this._pluginOptions.beforeSerialize!(getValue(state, key), key);

      // `undefined` means we have nothing to send. `null` means we send
      // `null`. So do not return `null` from `beforeSerialize` to skip a key.
      if (value === undefined) continue;

      this._transferState.set(this._stateKeyFor(key), value);
    }
  }

  private _stateKeyFor(key: string) {
    return makeStateKey<unknown>(`ngxs.storage:${getStorageKey(key, this._pluginOptions)}`);
  }
}
