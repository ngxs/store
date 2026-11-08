import { ErrorHandler, Injectable, Injector, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ɵhasOwnProperty, ɵPlainObject } from '@ngxs/store/internals';
import {
  NgxsPlugin,
  setValue,
  getValue,
  InitState,
  UpdateState,
  NgxsNextPluginFn,
  getActionTypeFromInstance
} from '@ngxs/store/plugins';
import {
  ɵDEFAULT_STATE_KEY,
  ɵALL_STATES_PERSISTED,
  ɵNGXS_STORAGE_PLUGIN_OPTIONS
} from '@ngxs/storage-plugin/internals';
import { tap } from 'rxjs';

import { getStorageKey } from './internals';
import { ɵNgxsStoragePluginKeysManager } from './keys-manager';
import { ɵSTORAGE_TRANSFER_STATE } from './transfer-state';

declare const ngDevMode: boolean;
declare const ngServerMode: boolean;

/** Reported to `ErrorHandler` when a persisted value fails to deserialize on read. */
export class NgxsStorageDeserializationError extends Error {
  override readonly name = 'NgxsStorageDeserializationError';

  constructor(
    readonly key: string,
    options?: ErrorOptions
  ) {
    super(
      typeof ngDevMode !== 'undefined' && ngDevMode
        ? `Error occurred while deserializing the ${key} store value, falling back to empty object.`
        : key,
      options
    );

    Object.setPrototypeOf(this, NgxsStorageDeserializationError.prototype);
  }
}

/** Reported to `ErrorHandler` when writing a persisted value exceeds the browser's storage quota. */
export class NgxsStorageQuotaExceededError extends Error {
  override readonly name = 'NgxsStorageQuotaExceededError';

  constructor(
    readonly key: string,
    options?: ErrorOptions
  ) {
    super(
      typeof ngDevMode !== 'undefined' && ngDevMode
        ? `The ${key} store value exceeds the browser storage quota.`
        : key,
      options
    );

    Object.setPrototypeOf(this, NgxsStorageQuotaExceededError.prototype);
  }
}

/** Reported to `ErrorHandler` when a persisted value fails to serialize (or otherwise write) on save. */
export class NgxsStorageSerializationError extends Error {
  override readonly name = 'NgxsStorageSerializationError';

  constructor(
    readonly key: string,
    options?: ErrorOptions
  ) {
    super(
      typeof ngDevMode !== 'undefined' && ngDevMode
        ? `Error occurred while serializing the ${key} store value, value not updated.`
        : key,
      options
    );

    Object.setPrototypeOf(this, NgxsStorageSerializationError.prototype);
  }
}

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  private _injector = inject(Injector);
  private _keysManager = inject(ɵNgxsStoragePluginKeysManager);
  private _options = inject(ɵNGXS_STORAGE_PLUGIN_OPTIONS);
  private _allStatesPersisted = inject(ɵALL_STATES_PERSISTED);
  private _transferState = inject(ɵSTORAGE_TRANSFER_STATE);
  private _errorHandler?: ErrorHandler;

  /**
   * Keys currently over quota. Once a key lands here, further quota errors
   * for it are swallowed rather than re-reported on every dispatch, since
   * they'll keep failing the same way until something frees up space. Cleared
   * once a write for that key succeeds again.
   */
  private _quotaExceededKeys = new Set<string>();

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (
      (typeof ngServerMode !== 'undefined' && ngServerMode) ||
      isPlatformServer(this._injector.get(PLATFORM_ID))
    ) {
      return next(state, event);
    }

    const type = getActionTypeFromInstance(event);
    const isInitAction = type === InitState.type;
    const isUpdateAction = type === UpdateState.type;
    const isInitOrUpdateAction = isInitAction || isUpdateAction;
    let hasMigration = false;
    const rehydratedFromTransfer = new Set<string>();

    if (isInitOrUpdateAction) {
      const addedStates: ɵPlainObject = isUpdateAction && event.addedStates;

      for (const { key, engine } of this._keysManager.getKeysWithEngines()) {
        // Keys can point to nested properties using dot notation.
        // For example, `keys: ['myState.myProperty']` is valid.
        // The state name must always come first.
        // This code gets the state name from the key.
        // For `myState.myProperty`, `stateName` will be `myState`.
        const dotNotationIndex = key.indexOf(DOT);
        const stateName = dotNotationIndex > -1 ? key.slice(0, dotNotationIndex) : key;

        // We're checking what states have been added by NGXS and if any of these states should be handled by
        // the storage plugin. For instance, we only want to deserialize the `auth` state, NGXS has added
        // the `user` state, the storage plugin will be rerun and will do redundant deserialization.
        // `usesDefaultStateKey` is necessary to check since `event.addedStates` never contains `@@STATE`.
        if (!this._allStatesPersisted && addedStates) {
          if (!ɵhasOwnProperty(addedStates, stateName)) continue;
        }

        // We take a value only if its state is already in the store.
        // During `InitState`, `addedStates` is empty, so the loop also sees keys
        // for states that are not in the store yet. If we take a value too early,
        // NGXS will replace it with the default value when that state is added.
        // Later, when NGXS sends its `UpdateState`, the value is already gone.
        const transferred = ɵhasOwnProperty(state, stateName)
          ? this._transferState?.take(key)
          : undefined;

        // We still read `persist: false` keys from the transfer state.
        // We just do not read or write them in the storage engine.
        // Guard against `engine` being falsy. Since it can be provided via DI,
        // we should assume it may be `null` or `undefined` at runtime and skip it safely.
        const usesEngine = !!engine && this._transferState?.persists(key) !== false;

        let storedValue: any;

        if (transferred !== undefined) {
          // The transfer state already has a normal object, so we do not need
          // to call `deserialize` here.
          storedValue = this._options.afterDeserialize!(transferred, key);
          rehydratedFromTransfer.add(key);
        } else {
          if (!usesEngine) continue;

          const storageKey = getStorageKey(key, this._options);
          const rawValue = engine!.getItem(storageKey);

          if (rawValue === 'undefined' || rawValue == null) continue;

          try {
            const newVal = this._options.deserialize!(rawValue);
            storedValue = this._options.afterDeserialize!(newVal, key);
          } catch (error) {
            (this._errorHandler ??= this._injector.get(ErrorHandler)).handleError(
              new NgxsStorageDeserializationError(storageKey, { cause: error })
            );

            storedValue = {};
          }
        }

        // A transferred value comes from the current build, so it already has
        // the new shape. The transfer state is also created again on every
        // render, so the strategy would run again on every SSR load.
        if (transferred === undefined) {
          this._options.migrations?.forEach(strategy => {
            const storedVersion = getValue(storedValue, strategy.versionKey || 'version') ?? 0;
            const versionMatch = strategy.version === storedVersion;
            const keyMatch =
              (!strategy.key && this._allStatesPersisted) || strategy.key === key;
            if (versionMatch && keyMatch) {
              storedValue = strategy.migrate(storedValue);
              hasMigration = true;
            }
          });
        }

        if (this._allStatesPersisted) {
          storedValue = this._hydrateSelectivelyOnUpdate(storedValue, addedStates);
          state = { ...state, ...storedValue };
        } else {
          state = setValue(state, key, storedValue);
        }
      }

      // With `keys: '*'`, the loop above runs only for the `@@STATE` key,
      // so it takes no values. After SSR, the storage engine is empty on the
      // first visit. This is the case this feature is made for, so we add
      // our states here.
      if (this._allStatesPersisted && this._transferState) {
        for (const sliceKey of this._transferState.coveredKeys()) {
          const dotNotationIndex = sliceKey.indexOf(DOT);
          const stateName =
            dotNotationIndex > -1 ? sliceKey.slice(0, dotNotationIndex) : sliceKey;

          // The same two checks like in the loop above, for the same reasons.
          if (addedStates && !ɵhasOwnProperty(addedStates, stateName)) continue;
          if (!ɵhasOwnProperty(state, stateName)) continue;

          const transferred = this._transferState.take(sliceKey);
          if (transferred === undefined) continue;

          state = setValue(
            state,
            sliceKey,
            this._options.afterDeserialize!(transferred, sliceKey)
          );
          // Here we write back the big object, not one state.
          rehydratedFromTransfer.add(ɵDEFAULT_STATE_KEY);
        }
      }
    }

    return next(state, event).pipe(
      tap(nextState => {
        let onlyKeys: Set<string> | null = null;

        if (isInitOrUpdateAction && !hasMigration) {
          // No values came from the transfer state.
          // The values we read are already in the engine, so we do not need
          // to write them again.
          if (!rehydratedFromTransfer.size) return;

          // Otherwise, we write back only the keys changed by the transfer state.
          onlyKeys = rehydratedFromTransfer;
        }

        for (const { key, engine } of this._keysManager.getKeysWithEngines()) {
          if (!engine) continue;
          // A transfer-only key is never saved to the storage engine.
          if (this._transferState?.persists(key) === false) continue;
          if (onlyKeys && !onlyKeys.has(key)) continue;

          let storedValue = nextState;

          const storageKey = getStorageKey(key, this._options);

          if (key !== ɵDEFAULT_STATE_KEY) {
            storedValue = getValue(nextState, key);
          }

          try {
            const newStoredValue = this._options.beforeSerialize!(storedValue, key);
            engine.setItem(storageKey, this._options.serialize!(newStoredValue));
            this._quotaExceededKeys.delete(storageKey);
          } catch (error: any) {
            const isQuotaError =
              error &&
              (error.name === 'QuotaExceededError' ||
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED');

            if (isQuotaError) {
              if (this._quotaExceededKeys.has(storageKey)) {
                continue;
              }
              this._quotaExceededKeys.add(storageKey);
            }

            (this._errorHandler ??= this._injector.get(ErrorHandler)).handleError(
              isQuotaError
                ? new NgxsStorageQuotaExceededError(storageKey, { cause: error })
                : new NgxsStorageSerializationError(storageKey, { cause: error })
            );
          }
        }
      })
    );
  }

  private _hydrateSelectivelyOnUpdate(storedValue: any, addedStates: ɵPlainObject) {
    // The `UpdateState` action is triggered whenever a feature state is added.
    // The condition below is only satisfied when this action is triggered.
    // Let's consider two states: `counter` and `@ngxs/router-plugin` state.
    // When `provideStore` is called, `CounterState` is provided at the root level,
    // while `@ngxs/router-plugin` is provided as a feature state. Previously, the storage
    // plugin might have stored the value of the counter state as `10`. If `CounterState`
    // implements the `ngxsOnInit` hook and sets the state to `999`, the storage plugin will
    // reset the entire state when the `RouterState` is registered.
    // Consequently, the `counter` state will revert back to `10` instead of `999`.

    if (!storedValue || !addedStates || Object.keys(addedStates).length === 0) {
      // Nothing to update if `addedStates` object is empty.
      return storedValue;
    }

    // The `storedValue` can be the entire state when the default state key
    // is used. However, if `addedStates` only contains the `router` value,
    // we only want to merge the state with that `router` value.
    // Given the `storedValue` is an object:
    // `{ counter: 10, router: {...} }`
    // This will only select the `router` object from the `storedValue`,
    // avoiding unnecessary rehydration of the `counter` state.
    return Object.keys(addedStates).reduce(
      (accumulator, addedState) => {
        if (ɵhasOwnProperty(storedValue, addedState)) {
          accumulator[addedState] = storedValue[addedState];
        }
        return accumulator;
      },
      <ɵPlainObject>{}
    );
  }
}

const DOT = '.';
