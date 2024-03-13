import { PLATFORM_ID, Inject, Injectable, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ɵPlainObject } from '@ngxs/store/internals';
import {
  NgxsPlugin,
  setValue,
  getValue,
  InitState,
  UpdateState,
  actionMatcher,
  NgxsNextPluginFn
} from '@ngxs/store/plugins';
import {
  ɵDEFAULT_STATE_KEY,
  ɵALL_STATES_PERSISTED,
  NgxsStoragePluginOptions,
  ɵNGXS_STORAGE_PLUGIN_OPTIONS
} from '@ngxs/storage-plugin/internals';
import { tap } from 'rxjs/operators';

import { getStorageKey } from './internals';
import { ɵNgxsStoragePluginKeysManager } from './keys-manager';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  private _allStatesPersisted = inject(ɵALL_STATES_PERSISTED);

  constructor(
    private _keysManager: ɵNgxsStoragePluginKeysManager,
    @Inject(ɵNGXS_STORAGE_PLUGIN_OPTIONS) private _options: NgxsStoragePluginOptions,
    @Inject(PLATFORM_ID) private _platformId: string
  ) {}

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (isPlatformServer(this._platformId)) {
      return next(state, event);
    }

    const matches = actionMatcher(event);
    const isInitAction = matches(InitState);
    const isUpdateAction = matches(UpdateState);
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
          if (!addedStates.hasOwnProperty(stateName)) {
            continue;
          }
        }

        const storageKey = getStorageKey(key, this._options);
        let storedValue: any = engine.getItem(storageKey);

        if (storedValue !== 'undefined' && storedValue != null) {
          try {
            const newVal = this._options.deserialize!(storedValue);
            storedValue = this._options.afterDeserialize!(newVal, key);
          } catch {
            NG_DEV_MODE &&
              console.error(
                `Error ocurred while deserializing the ${storageKey} store value, falling back to empty object, the value obtained from the store: `,
                storedValue
              );

            storedValue = {};
          }

          this._options.migrations?.forEach(strategy => {
            const versionMatch =
              strategy.version === getValue(storedValue, strategy.versionKey || 'version');
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
        if (isInitOrUpdateAction && !hasMigration) {
          return;
        }

        for (const { key, engine } of this._keysManager.getKeysWithEngines()) {
          let storedValue = nextState;

          const storageKey = getStorageKey(key, this._options);

          if (key !== ɵDEFAULT_STATE_KEY) {
            storedValue = getValue(nextState, key);
          }

          try {
            const newStoredValue = this._options.beforeSerialize!(storedValue, key);
            engine.setItem(storageKey, this._options.serialize!(newStoredValue));
          } catch (error: any) {
            if (NG_DEV_MODE) {
              if (
                error &&
                (error.name === 'QuotaExceededError' ||
                  error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
              ) {
                console.error(
                  `The ${storageKey} store value exceeds the browser storage quota: `,
                  storedValue
                );
              } else {
                console.error(
                  `Error ocurred while serializing the ${storageKey} store value, value not updated, the value obtained from the store: `,
                  storedValue
                );
              }
            }
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
        if (storedValue.hasOwnProperty(addedState)) {
          accumulator[addedState] = storedValue[addedState];
        }
        return accumulator;
      },
      <ɵPlainObject>{}
    );
  }
}

const DOT = '.';
