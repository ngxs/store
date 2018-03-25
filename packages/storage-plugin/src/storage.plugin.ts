import { Inject, Injectable } from '@angular/core';
import { NgxsPlugin, getActionTypeFromInstance, setValue, getValue } from '@ngxs/store';

import { NgxsStoragePluginOptions, NGXS_STORAGE_PLUGIN_OPTIONS, STORAGE_ENGINE, StorageEngine } from './symbols';

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  constructor(
    @Inject(NGXS_STORAGE_PLUGIN_OPTIONS) private _options: NgxsStoragePluginOptions,
    @Inject(STORAGE_ENGINE) private _engine: StorageEngine
  ) {}

  handle(state, event, next) {
    const options = this._options || <any>{};
    const isInitAction = getActionTypeFromInstance(event) === '@@INIT';
    const keys = Array.isArray(options.key) ? options.key : [options.key];

    if (isInitAction) {
      for (const key of keys) {
        let val = this._engine.getItem(key);

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

    const res = next(state, event);

    res.subscribe(nextState => {
      if (!isInitAction) {
        for (const key of keys) {
          let val = nextState;

          if (key !== '@@STATE') {
            val = getValue(nextState, key);
          }

          this._engine.setItem(key, options.serialize(val));
        }
      }
    });

    return res;
  }
}
