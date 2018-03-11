import { Inject, Injectable } from '@angular/core';
import { NgxsPlugin } from '../../symbols';
import { LocalStoragePluginOptions, LOCAL_STORAGE_PLUGIN_OPTIONS, StorageStrategy } from './symbols';
import { getTypeFromInstance } from '../../internals';
import { setValue, getValue } from './utils';

@Injectable()
export class LocalStoragePlugin implements NgxsPlugin {
  constructor(@Inject(LOCAL_STORAGE_PLUGIN_OPTIONS) private _options: LocalStoragePluginOptions) {}

  handle(state, event, next) {
    const options = this._options || <any>{};
    const isInitAction = getTypeFromInstance(event) === '@@INIT';
    const keys = Array.isArray(options.key) ? options.key : [options.key];
    const engine = options.strategy === StorageStrategy.localstorage ? localStorage : sessionStorage;

    if (isInitAction) {
      for (const key of keys) {
        let val = engine.getItem(key);

        if (val !== 'undefined' && val !== null) {
          val = options.deserialize(val);

          if (key !== '@@STATE') {
            state = setValue(state, key, val);
          } else {
            state = val;
          }
        }
      }
    }

    state = next(state, event);

    if (!isInitAction) {
      for (const key of keys) {
        let val = state;

        if (key !== '@@STATE') {
          val = getValue(state, key);
        }

        engine.setItem(key, options.serialize(val));
      }
    }

    return state;
  }
}
