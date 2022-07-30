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
import { tap } from 'rxjs/operators';

import {
  StorageEngine,
  NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  NGXS_STORAGE_PLUGIN_OPTIONS
} from './symbols';
import { DEFAULT_STATE_KEY } from './internals';

/**
 * @description Will be provided through Terser global definitions by Angular CLI
 * during the production build. This is how Angular does tree-shaking internally.
 */
declare const ngDevMode: boolean;

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  // We cast to `string[]` here as we're sure that this option has been
  // transformed by the `storageOptionsFactory` function that provided token.
  private _keys = this._options.key as string[];
  // We default to `[DEFAULT_STATE_KEY]` if the user explicitly does not provide the `key` option.
  private _usesDefaultStateKey =
    this._keys.length === 1 && this._keys[0] === DEFAULT_STATE_KEY;

  constructor(
    @Inject(NGXS_STORAGE_PLUGIN_OPTIONS) private _options: NgxsStoragePluginOptions,
    @Inject(STORAGE_ENGINE) private _engine: StorageEngine,
    @Inject(PLATFORM_ID) private _platformId: string
  ) {}

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (isPlatformServer(this._platformId) && this._engine === null) {
      return next(state, event);
    }

    const matches = actionMatcher(event);
    const isInitAction = matches(InitState);
    const isUpdateAction = matches(UpdateState);
    const isInitOrUpdateAction = isInitAction || isUpdateAction;
    let hasMigration = false;

    if (isInitOrUpdateAction) {
      const addedStates = isUpdateAction && event.addedStates;

      for (const key of this._keys) {
        // We're checking what states have been added by NGXS and if any of these states should be handled by
        // the storage plugin. For instance, we only want to deserialize the `auth` state, NGXS has added
        // the `user` state, the storage plugin will be rerun and will do redundant deserialization.
        // `usesDefaultStateKey` is necessary to check since `event.addedStates` never contains `@@STATE`.
        if (!this._usesDefaultStateKey && addedStates && !addedStates.hasOwnProperty(key)) {
          continue;
        }

        let storageValue: any = this._engine.getItem(key!);

        if (storageValue !== 'undefined' && storageValue != null) {
          try {
            const newVal = this._options.deserialize!(storageValue);
            storageValue = this._options.afterDeserialize!(newVal, key);
          } catch {
            // Caretaker note: we have still left the `typeof` condition in order to avoid
            // creating a breaking change for projects that still use the View Engine.
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
              console.error(
                `Error ocurred while deserializing the ${key} store value, falling back to empty object, the value obtained from the store: `,
                storageValue
              );
            }
            storageValue = {};
          }

          if (this._options.migrations) {
            this._options.migrations.forEach(strategy => {
              const versionMatch =
                strategy.version === getValue(storageValue, strategy.versionKey || 'version');
              const keyMatch =
                (!strategy.key && this._usesDefaultStateKey) || strategy.key === key;
              if (versionMatch && keyMatch) {
                storageValue = strategy.migrate(storageValue);
                hasMigration = true;
              }
            });
          }

          if (!this._usesDefaultStateKey) {
            state = setValue(state, key!, storageValue);
          } else {
            // The `UpdateState` action is dispatched whenever the feature state is added.
            // The below condition is met only when the `UpdateState` is dispatched.
            // Let's assume that we have 2 states `counter` and `@ngxs/router-plugin` state.
            // `CounterState` is provided on the root level when calling `NgxsModule.forRoot()`
            // and `@ngxs/router-plugin` is provided as a feature state.
            // The storage plugin may save the `counter` state value as `10` before.
            // The `CounterState` may implement the `ngxsOnInit` hook and call `ctx.setState(999)`.
            // The storage plugin will re-hydrate the whole state when the `RouterState` is registered,
            // and the `counter` state will again equal `10` (not `999`).
            if (storageValue && addedStates && Object.keys(addedStates).length > 0) {
              storageValue = Object.keys(addedStates).reduce((accumulator, addedState) => {
                // The `storageValue` may equal the whole state (when the default state key is used).
                // If `addedStates` contains only `router` then we want to merge the state only
                // with the `router` value.
                // Let's assume that the `storageValue` is an object:
                // `{ counter: 10, router: {...} }`
                // This will pick only the `router` object from the `storageValue` and `counter`
                // state will not be re-hydrated unnecessary.
                if (storageValue.hasOwnProperty(addedState)) {
                  accumulator[addedState] = storageValue[addedState];
                }
                return accumulator;
              }, <PlainObject>{});
            }

            state = { ...state, ...storageValue };
          }
        }
      }
    }

    return next(state, event).pipe(
      tap(nextState => {
        if (!isInitOrUpdateAction || (isInitOrUpdateAction && hasMigration)) {
          for (const key of this._keys) {
            let val = nextState;

            if (key !== DEFAULT_STATE_KEY) {
              val = getValue(nextState, key!);
            }

            try {
              const newVal = this._options.beforeSerialize!(val, key);
              this._engine.setItem(key!, this._options.serialize!(newVal));
            } catch (error) {
              // Caretaker note: we have still left the `typeof` condition in order to avoid
              // creating a breaking change for projects that still use the View Engine.
              if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (
                  error &&
                  (error.name === 'QuotaExceededError' ||
                    error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
                ) {
                  console.error(
                    `The ${key} store value exceeds the browser storage quota: `,
                    val
                  );
                } else {
                  console.error(
                    `Error ocurred while serializing the ${key} store value, value not updated, the value obtained from the store: `,
                    val
                  );
                }
              }
            }
          }
        }
      })
    );
  }
}
