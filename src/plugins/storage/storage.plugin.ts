import { Inject, Injectable } from '@angular/core';
import { NgxsPlugin } from '../../symbols';
import { NgxsStoragePluginOptions, NGXS_STORAGE_PLUGIN_OPTIONS, NgxStorageStrategy } from './symbols';
import { getTypeFromInstance, setValue, getValue } from '../../internals';

@Injectable()
export class NgxsStoragePlugin implements NgxsPlugin {
  constructor(@Inject(NGXS_STORAGE_PLUGIN_OPTIONS) private _options: NgxsStoragePluginOptions) {
    this._options = _options || <any>{};
  }

  handle(state, event, next) {
    const isInitAction = getTypeFromInstance(event) === '@@INIT';
    const keys = Array.isArray(this._options.key) ? this._options.key : [this._options.key];
    const engine = this._options.storage === NgxStorageStrategy.sessionStorage ? sessionStorage : localStorage;

    if (isInitAction) {
      for (const key of keys) {
        let val = engine.getItem(key);

        if (val !== 'undefined' && val !== null) {
          val = this._options.deserialize(val);

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

          engine.setItem(key, this._options.serialize(val));
        }
      }
    });

    return res;
  }
}
