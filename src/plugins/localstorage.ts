import { Injectable, NgModule, ModuleWithProviders, Inject, InjectionToken } from '@angular/core';

import { NgxsPlugin, NGXS_PLUGINS } from '../symbols';
import { getTypeFromInstance } from '../internals';

export interface LocalStoragePluginOptions {
  key?: string | string[] | undefined;
  serialize?(obj: any);
  deserialize?(obj: any);
}

export const LOCAL_STORAGE_PLUGIN_OPTIONS = new InjectionToken('LOCAL_STORAGE_PLUGIN_OPTION');

const setValue = (obj, prop: string, val) => {
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

const getValue = (obj, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);

@Injectable()
export class LocalStoragePlugin implements NgxsPlugin {
  constructor(@Inject(LOCAL_STORAGE_PLUGIN_OPTIONS) private _options: LocalStoragePluginOptions) {}

  handle(state, event, next) {
    const options = this._options || <any>{};
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

export function serialize(val: any) {
  return JSON.stringify(val);
}

export function deserialize(val: any) {
  return JSON.parse(val);
}

@NgModule()
export class LocalStoragePluginModule {
  static forRoot(options: LocalStoragePluginOptions = {}): ModuleWithProviders {
    return {
      ngModule: LocalStoragePluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: LocalStoragePlugin,
          multi: true
        },
        {
          provide: LOCAL_STORAGE_PLUGIN_OPTIONS,
          useValue: {
            key: options.key || '@@STATE',
            serialize: options.serialize || serialize,
            deserialize: options.deserialize || deserialize
          }
        }
      ]
    };
  }
}
