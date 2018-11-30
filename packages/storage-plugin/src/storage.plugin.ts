import { Inject, Injectable } from '@angular/core';
import { actionMatcher, getValue, InitState, NgxsPlugin, setValue, UpdateState } from '@ngxs/store';

import {
  AsyncStorageEngine,
  AsyncStorageEngineProxy,
  NGXS_STORAGE_PLUGIN_OPTIONS,
  NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  StorageEngine,
  StorageEngineType
} from './symbols';
import { concatMap, map, reduce, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  private _asyncEngine: AsyncStorageEngine;

  constructor(
    @Inject(NGXS_STORAGE_PLUGIN_OPTIONS) private _options: NgxsStoragePluginOptions,
    @Inject(STORAGE_ENGINE) private _engine: StorageEngine | AsyncStorageEngine
  ) {
    if (this._options.storageEngineType === StorageEngineType.Synchronous) {
      this._asyncEngine = new AsyncStorageEngineProxy(<StorageEngine>this._engine);
    } else {
      this._asyncEngine = <AsyncStorageEngine>this._engine;
    }
  }

  handle(state, event, next) {
    const options = this._options || <any>{};
    const matches = actionMatcher(event);
    const isInitAction = matches(InitState) || matches(UpdateState);
    const keys: string[] = Array.isArray(options.key) ? options.key : [options.key];
    let hasMigration = false;
    let initAction: Observable<any> = of(state);

    if (isInitAction) {
      initAction = from(keys).pipe(
        concatMap(key => this._asyncEngine.getItem(key).pipe(map(val => [key, val]))),
        reduce((previousState, [key, val]) => {
          const isMaster = key === '@@STATE';
          let nextState = previousState;
          if (typeof val !== 'undefined' && val !== null) {
            try {
              val = options.deserialize(val);
            } catch (e) {
              console.error('Error ocurred while deserializing the store value, falling back to empty object.');
              val = {};
            }

            if (options.migrations) {
              options.migrations.forEach(strategy => {
                const versionMatch = strategy.version === getValue(val, strategy.versionKey || 'version');
                const keyMatch = (!strategy.key && isMaster) || strategy.key === key;
                if (versionMatch && keyMatch) {
                  val = strategy.migrate(val);
                  hasMigration = true;
                }
              });
            }
            if (!isMaster) {
              nextState = setValue(previousState, key, val);
            } else {
              nextState = { ...previousState, ...val };
            }
          }
          return nextState;
        }, state)
      );
    }

    return initAction.pipe(
      concatMap(stateAfterInit => next(stateAfterInit, event)),
      tap(nextState => {
        if (!isInitAction || (isInitAction && hasMigration)) {
          for (const key of keys) {
            let val = nextState;

            if (key !== '@@STATE') {
              val = getValue(nextState, key);
            }

            try {
              this._asyncEngine.setItem(key, options.serialize(val));
            } catch (e) {
              console.error('Error ocurred while serializing the store value, value not updated.');
            }
          }
        }
      })
    );
  }
}
