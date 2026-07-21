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

    if (isInitOrUpdateAction) {
      const addedStates: ɵPlainObject = isUpdateAction && event.addedStates;

      for (const { key, engine } of this._keysManager.getKeysWithEngines()) {
        // We're checking what states have been added by NGXS and if any of these states should be handled by
        // the storage plugin. For instance, we only want to deserialize the `auth` state, NGXS has added
        // the `user` state, the storage plugin will be rerun and will do redundant deserialization.
        // `usesDefaultStateKey` is necessary to check since `event.addedStates` never contains `@@STATE`.
        if (!this._allStatesPersisted && addedStates) {
          // We support providing keys that can be deeply nested via dot notation, for instance,
          // `keys: ['myState.myProperty']` is a valid key.
          // The state name should always go first. The below code checks if the `key` includes dot
          // notation and extracts the state name out of the key.
          // Given the `key` is `myState.myProperty`, the `addedStates` will only contain `myState`.
          const dotNotationIndex = key.indexOf(DOT);
          const stateName = dotNotationIndex > -1 ? key.slice(0, dotNotationIndex) : key;
          if (!ɵhasOwnProperty(addedStates, stateName)) continue;
        }

        // Guard against `engine` being falsy. Since it can be provided via DI,
        // we should assume it may be `null` or `undefined` at runtime and skip it safely.
        if (!engine) continue;

        const storageKey = getStorageKey(key, this._options);
        let storedValue: any = engine.getItem(storageKey);

        if (storedValue !== 'undefined' && storedValue != null) {
          try {
            const newVal = this._options.deserialize!(storedValue);
            storedValue = this._options.afterDeserialize!(newVal, key);
          } catch (error) {
            (this._errorHandler ??= this._injector.get(ErrorHandler)).handleError(
              new NgxsStorageDeserializationError(storageKey, { cause: error })
            );

            storedValue = {};
          }

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

          if (this._allStatesPersisted) {
            storedValue = this._hydrateSelectivelyOnUpdate(storedValue, addedStates);
            state = { ...state, ...storedValue };
          } else {
            state = setValue(state, key, storedValue);
          }
        }
      }
    }

    return next(state, event).pipe(
      tap(nextState => {
        if (isInitOrUpdateAction && !hasMigration && !this._options.persistOnInit) {
          return;
        }

        for (const { key, engine } of this._keysManager.getKeysWithEngines()) {
          if (!engine) continue;

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
