import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  actionMatcher,
  getValue,
  InitState,
  NgxsNextPluginFn,
  NgxsPlugin,
  setValue,
  UpdateState
} from '@ngxs/store';
import { from, isObservable, Observable, of } from 'rxjs';
import { concatMap, map, reduce, tap } from 'rxjs/operators';
import { DEFAULT_STATE_KEY, ResolvedPluginEngines, ResolvedPluginOptions } from './internals';

import { NgxsAsyncStorageMigrations, NGXS_ASYNC_STORAGE_PLUGIN_OPTIONS } from './symbols';

/**
 * @description Will be provided through Terser global definitions by Angular CLI
 * during the production build. This is how Angular does tree-shaking internally.
 */
declare const ngDevMode: boolean;

@Injectable()
export class NgxsAsyncStoragePlugin implements NgxsPlugin {
  keys: string[];
  storages: Record<string, ResolvedPluginEngines>;

  constructor(
    @Inject(NGXS_ASYNC_STORAGE_PLUGIN_OPTIONS) private _options: ResolvedPluginOptions,
    @Inject(PLATFORM_ID) private _platformId: string
  ) {
    this.keys = this._options.storages.reduce(
      (acc: string[], cur) => acc.concat(cur.keys),
      []
    );

    this.storages = this.keys.reduce((acc: Record<string, ResolvedPluginEngines>, cur) => {
      const item = this._options.storages.find(({ keys }) => keys.includes(cur));
      if (item) acc[cur] = item;
      return acc;
    }, {});
  }

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (isPlatformServer(this._platformId) && this.keys.length === 0) {
      return next(state, event);
    }

    const matches = actionMatcher(event);
    const isInitAction = matches(InitState) || matches(UpdateState);
    let hasMigration = false;
    let initAction: Observable<any> = of(state);

    if (isInitAction) {
      console.log('Is init action');
      initAction = from(this.keys).pipe(
        concatMap(key => {
          const result = this.storages[key].engine.get(key);
          console.log('Concatmap result', result);
          let observable: Observable<any>;
          if (isObservable(result)) observable = result;
          else if (result instanceof Promise) observable = from(result);
          else observable = of(result);
          console.log('Concatmap observable', observable);

          return observable.pipe(
            map<any, [string, any]>(val => [key, val])
          );
        }),
        reduce((previousState, [key, val]) => {
          const isMaster = key === DEFAULT_STATE_KEY;
          let nextState = previousState;
          const storage = this.storages[key];

          let newVal: any;
          console.log({
            isMaster,
            nextState,
            previousState,
            storage,
            newVal,
            keyVal: [key, val]
          });

          const doMigrations = (strategy: NgxsAsyncStorageMigrations) => {
            const versionMatch =
              strategy.version === getValue(val, strategy.versionKey || 'version');
            const keyMatch = (!strategy.key && isMaster) || strategy.key === key;
            console.log('doing migrations', {
              versionMatch,
              keyMatch,
              strategy
            });

            if (versionMatch && keyMatch) {
              newVal = strategy.migrate(newVal);
              hasMigration = true;
            }
          };

          if (val !== 'undefined' && typeof val !== 'undefined' && val !== null) {
            console.log('Not falsy or undefined, val:', val);
            if (storage.serializers.deserialize) {
              console.log('deserializing');
              try {
                newVal = storage.serializers.deserialize(val);
                console.log('Newval deserialize', newVal);
                if (storage.serializers.afterDeserialize)
                  newVal = storage.serializers.afterDeserialize(newVal, key);
                console.log('Newval afterDeserialize', newVal);
              } catch (err) {
                if (typeof ngDevMode === 'undefined' || ngDevMode) {
                  console.error(
                    `Error ocurred while deserializing the ${key} store value, falling back to empty object, the value obtained from the store: `,
                    val
                  );
                }
                newVal = {};
                console.log('error deserializing, val:', val);
              }
            }

            if (storage.migrations && storage.migrations.length > 0) {
              storage.migrations.forEach(doMigrations);
            }

            if (!isMaster) {
              state = setValue(state, key, val);
              console.log('is not master, state: ', state);
            } else {
              state = { ...state, ...val };
              console.log('is master, state: ', state);
            }
          } else {
            console.log('IS falsy or undefined, val: ', val);
            if (storage.migrations && storage.migrations.length > 0) {
              if (isMaster) {
                console.log('is master, state: ', state);
                val = Object.assign({}, state);
              } else {
                val = getValue(state, key);
                console.log('is not master, state: ', state);
              }

              storage.migrations.forEach(doMigrations);

              if (!isMaster) {
                console.log('is not master, nextState prevState: ', {
                  nextState,
                  previousState
                });
                nextState = setValue(previousState, key, val);
              } else {
                nextState = { ...previousState, ...val };
                console.log('is master, nextState prevState: ', {
                  nextState,
                  previousState
                });
              }
            }
          }

          return nextState;
        }, state)
      );
    }

    return initAction.pipe(
      concatMap(stateAfterInit => next(stateAfterInit, event)),
      tap((nextState: any) => {
        if (!isInitAction || (isInitAction && hasMigration)) {
          console.log('is not an init action or has a migration');
          for (const key of this.keys) {
            const storage = this.storages[key];
            let val = nextState;
            console.log({ key, storage, val });

            if (key !== DEFAULT_STATE_KEY) {
              val = getValue(nextState, key);
              console.log('not default state key, val: ', val);
            }

            let serializedVal: any = val;
            let serializerError = false;
            if (storage.serializers.serialize) {
              console.log('serializing');
              try {
                if (storage.serializers.beforeSerialize)
                  serializedVal = storage.serializers.beforeSerialize(val, key);
                console.log('val beforeSerialize', serializedVal);
                serializedVal = storage.serializers.serialize(serializedVal);
                console.log('val serialize', serializedVal);
              } catch (err) {
                console.log('was an error serializing');
                if (typeof ngDevMode === 'undefined' || ngDevMode) {
                  console.error(
                    'Error ocurred while serializing the store value, value not updated.',
                    serializedVal,
                    val
                  );
                }
                serializerError = true;
              }
            }

            if (serializerError === false) {
              storage.engine.set(key, serializedVal);
              console.log('no error, setting', { key, serializedVal });
            }
          }
        }
      })
    );
  }
}
