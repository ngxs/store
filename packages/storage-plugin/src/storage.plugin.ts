import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { PlainObject } from '@ngxs/store/internals';
import {
  NgxsPlugin,
  setValue,
  getValue,
  InitState,
  UpdateState,
  actionMatcher,
  NgxsNextPluginFn
} from '@ngxs/store';
import {
  ɵDEFAULT_STATE_KEY,
  ɵFinalNgxsStoragePluginOptions,
  ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS
} from '@ngxs/storage-plugin/internals';
import { tap } from 'rxjs/operators';

import { getStorageKey } from './internals';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  private _keysWithEngines = this._options.keysWithEngines;
  // We default to `[ɵDEFAULT_STATE_KEY]` if the user explicitly does not provide the `key` option.
  private _usesDefaultStateKey =
    this._keysWithEngines.length === 1 && this._keysWithEngines[0].key === ɵDEFAULT_STATE_KEY;

  constructor(
    @Inject(ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS)
    private _options: ɵFinalNgxsStoragePluginOptions,
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
      const addedStates = isUpdateAction && event.addedStates;

      for (const { key, engine } of this._keysWithEngines) {
        // We're checking what states have been added by NGXS and if any of these states should be handled by
        // the storage plugin. For instance, we only want to deserialize the `auth` state, NGXS has added
        // the `user` state, the storage plugin will be rerun and will do redundant deserialization.
        // `usesDefaultStateKey` is necessary to check since `event.addedStates` never contains `@@STATE`.
        if (!this._usesDefaultStateKey && addedStates) {
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
              (!strategy.key && this._usesDefaultStateKey) || strategy.key === key;
            if (versionMatch && keyMatch) {
              storedValue = strategy.migrate(storedValue);
              hasMigration = true;
            }
          });

          if (!this._usesDefaultStateKey) {
            state = setValue(state, key, storedValue);
          } else {
            // The `UpdateState` action is dispatched whenever the feature
            // state is added. The condition below is satisfied only when
            // the `UpdateState` action is dispatched. Let's consider two states:
            // `counter` and `@ngxs/router-plugin` state. When we call `NgxsModule.forRoot()`,
            // `CounterState` is provided at the root level, while `@ngxs/router-plugin`
            // is provided as a feature state. Beforehand, the storage plugin may have
            // stored the value of the counter state as `10`. If `CounterState` implements
            // the `ngxsOnInit` hook and calls `ctx.setState(999)`, the storage plugin
            // will rehydrate the entire state when the `RouterState` is registered.
            // Consequently, the `counter` state will revert back to `10` instead of `999`.
            if (storedValue && addedStates && Object.keys(addedStates).length > 0) {
              storedValue = Object.keys(addedStates).reduce((accumulator, addedState) => {
                // The `storedValue` can be equal to the entire state when the default
                // state key is used. However, if `addedStates` only contains the `router` value,
                // we only want to merge the state with the `router` value.
                // Let's assume that the `storedValue` is an object:
                // `{ counter: 10, router: {...} }`
                // This will pick only the `router` object from the `storedValue` and `counter`
                // state will not be rehydrated unnecessary.
                if (storedValue.hasOwnProperty(addedState)) {
                  accumulator[addedState] = storedValue[addedState];
                }
                return accumulator;
              }, <PlainObject>{});
            }

            state = { ...state, ...storedValue };
          }
        }
      }
    }

    return next(state, event).pipe(
      tap(nextState => {
        if (isInitOrUpdateAction && !hasMigration) {
          return;
        }

        for (const { key, engine } of this._keysWithEngines) {
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
}

const DOT = '.';
