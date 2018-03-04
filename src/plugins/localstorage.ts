import { NgxsPlugin } from '../symbols';
import { Injectable } from '@angular/core';
import { getTypeFromInstance } from '../internals';

export interface LocalStoragePluginOptions {
  key: string | string[] | undefined;
  serialize(obj: any);
  deserialize(obj: any);
}

const setValue = (obj, prop, val) => {
  obj = { ...obj };
  const split = prop.split('.');
  const last = split[split.length - 1];
  split.reduce((acc, part) => {
    if (part === last) {
      acc[part] = val;
    } else {
      acc[part] = { ...acc[part] };
    }
    return acc && acc[part];
  }, obj);
  return obj;
};

const getValue = (obj, prop) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);

@Injectable()
export class LocalStoragePlugin implements NgxsPlugin {
  private static _options: LocalStoragePluginOptions | undefined = undefined;

  static forRoot(options) {
    this._options = options;
    return this;
  }

  constructor() {
    if (!LocalStoragePlugin._options) {
      LocalStoragePlugin._options = {
        key: '@@STATE',
        serialize: JSON.stringify,
        deserialize: JSON.parse
      };
    }
  }

  handle(state, event, next) {
    const options = LocalStoragePlugin._options || <any>{};
    const isInitAction = getTypeFromInstance(event) === '@@INIT';
    const keys = Array.isArray(options.key) ? options.key : [options.key];

    if (isInitAction) {
      for (const key of keys) {
        let val = localStorage.getItem(key);
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
        localStorage.setItem(key, options.serialize(val));
      }
    }

    return state;
  }
}
