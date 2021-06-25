import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformServer } from '@angular/common';
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
  constructor(
    @Inject(NGXS_STORAGE_PLUGIN_OPTIONS) private _options: NgxsStoragePluginOptions,
    @Inject(STORAGE_ENGINE) private _engine: StorageEngine,
    @Inject(PLATFORM_ID) private _platformId: string
  ) {}

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (isPlatformServer(this._platformId) && this._engine === null) {
      return next(state, event);
    }

    // We cast to `string[]` here as we're sure that this option has been
    // transformed by the `storageOptionsFactory` function that provided token
    const keys = this._options.key as string[];
    const matches = actionMatcher(event);
    const isInitAction = matches(InitState);
    const isUpdateAction = matches(UpdateState);
    const isInitOrUpdateAction = isInitAction || isUpdateAction;
    let hasMigration = false;

    if (isInitOrUpdateAction) {
      for (const key of keys) {
        // We're checking what states have been added by NGXS and if any of these states should be handled by
        // the storage plugin. For instance, we only want to deserialize the `auth` state, NGXS has added
        // the `user` state, the storage plugin will be rerun and will do redundant deserialization.
        if (isUpdateAction && event.addedStates && !event.addedStates.hasOwnProperty(key)) {
          continue;
        }

        const isMaster = key === DEFAULT_STATE_KEY;
        let val: any = this._engine.getItem(key!);

        if (val !== 'undefined' && val != null) {
          try {
            const newVal = this._options.deserialize!(val);
            val = this._options.afterDeserialize!(newVal, key);
          } catch (e) {
            // Caretaker note: we have still left the `typeof` condition in order to avoid
            // creating a breaking change for projects that still use the View Engine.
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
              console.error(
                `Error ocurred while deserializing the ${key} store value, falling back to empty object, the value obtained from the store: `,
                val
              );
            }
            val = {};
          }

          if (this._options.migrations) {
            this._options.migrations.forEach(strategy => {
              const versionMatch =
                strategy.version === getValue(val, strategy.versionKey || 'version');
              const keyMatch = (!strategy.key && isMaster) || strategy.key === key;
              if (versionMatch && keyMatch) {
                val = strategy.migrate(val);
                hasMigration = true;
              }
            });
          }

          if (!isMaster) {
            state = setValue(state, key!, val);
          } else {
            state = { ...state, ...val };
          }
        }
      }
    }

    return next(state, event).pipe(
      tap(nextState => {
        if (!isInitOrUpdateAction || (isInitOrUpdateAction && hasMigration)) {
          for (const key of keys) {
            let val = nextState;

            if (key !== DEFAULT_STATE_KEY) {
              val = getValue(nextState, key!);
            }

            try {
              const newVal = this._options.beforeSerialize!(val, key);
              this._engine.setItem(key!, this._options.serialize!(newVal));
            } catch (e) {
              // Caretaker note: we have still left the `typeof` condition in order to avoid
              // creating a breaking change for projects that still use the View Engine.
              if (typeof ngDevMode === 'undefined' || ngDevMode) {
                console.error(
                  `Error ocurred while serializing the ${key} store value, value not updated, the value obtained from the store: `,
                  val
                );
              }
            }
          }
        }
      })
    );
  }
}
