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
    const isInitAction = matches(InitState) || matches(UpdateState);
    let hasMigration = false;

    if (isInitAction) {
      for (const key of keys) {
        const isMaster = key === DEFAULT_STATE_KEY;
        let val: any = this._engine.getItem(key!);

        if (val !== 'undefined' && typeof val !== 'undefined' && val !== null) {
          try {
            val = this._options.deserialize!(val);
          } catch (e) {
            console.error(
              'Error ocurred while deserializing the store value, falling back to empty object.'
            );
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
        if (!isInitAction || (isInitAction && hasMigration)) {
          for (const key of keys) {
            let val = nextState;

            if (key !== DEFAULT_STATE_KEY) {
              val = getValue(nextState, key!);
            }

            try {
              this._engine.setItem(key!, this._options.serialize!(val));
            } catch (e) {
              console.error(
                'Error ocurred while serializing the store value, value not updated.'
              );
            }
          }
        }
      })
    );
  }
}
