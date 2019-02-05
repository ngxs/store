import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import { NgxsStoragePlugin } from './storage.plugin';
import {
  NgxsStoragePluginOptions,
  NGXS_STORAGE_PLUGIN_OPTIONS,
  StorageOption,
  STORAGE_ENGINE,
  StorageEngine
} from './symbols';

import { SimpleSynchronizedStorage } from './storage-engine';

export function storageOptionsFactory(options: NgxsStoragePluginOptions) {
  return {
    key: '@@STATE',
    storage: StorageOption.LocalStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    ...options
  };
}

export function engineFactory(options: NgxsStoragePluginOptions): StorageEngine | null {
  if (options.storage === StorageOption.LocalStorage) {
    // todo: remove any here
    return new SimpleSynchronizedStorage(localStorage);
  } else if (options.storage === StorageOption.SessionStorage) {
    return new SimpleSynchronizedStorage(sessionStorage);
  }
  console.warn('engineFactory returns null');
  return null;
}

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');

@NgModule()
export class NgxsStoragePluginModule {
  static forRoot(options?: NgxsStoragePluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsStoragePluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsStoragePlugin,
          multi: true
        },
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_STORAGE_PLUGIN_OPTIONS,
          useFactory: storageOptionsFactory,
          deps: [USER_OPTIONS]
        },
        {
          provide: STORAGE_ENGINE,
          useFactory: engineFactory,
          deps: [NGXS_STORAGE_PLUGIN_OPTIONS]
        }
      ]
    };
  }
}
