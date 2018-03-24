import { Inject, Injectable } from '@angular/core';
import { NgxsPlugin } from '../../symbols';
import { NgxsLocalStoragePluginOptions, NGXS_LOCAL_STORAGE_PLUGIN_OPTIONS } from './symbols';

import { getTypeFromInstance, setValue, getValue } from '../../internals';

@Injectable()
export class NgxsLocalStoragePlugin implements NgxsPlugin {
  constructor(@Inject(NGXS_LOCAL_STORAGE_PLUGIN_OPTIONS) private _options: NgxsLocalStoragePluginOptions) {}

  handle(state, event, next) {
    const options = this._options || <any>{};
    const isInitAction = getTypeFromInstance(event) === '@@INIT';
    const keys = Array.isArray(options.key) ? options.key : [options.key];
    const engine = options.storage || localStorage;

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

    const res = next(state, event);

    res.subscribe(nextState => {
      if (!isInitAction) {
        for (const key of keys) {
          let val = nextState;

          if (key !== '@@STATE') {
            val = getValue(nextState, key);
          }

          engine.setItem(key, options.serialize(val));
        }
      }
    });

    return res;
  }
}
