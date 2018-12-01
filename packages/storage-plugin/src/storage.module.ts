import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import { NgxsStoragePlugin } from './storage.plugin';
import {
  NGXS_STORAGE_PLUGIN_OPTIONS,
  NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  StorageEngine,
  StorageOption
} from './symbols';

export function storageOptionsFactory(options: NgxsStoragePluginOptions) {
  return {
    key: '@@STATE',
    storage: StorageOption.LocalStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    ...options
  };
}

export function engineFactory(options: NgxsStoragePluginOptions): StorageEngine {
  switch (options.storage) {
    case StorageOption.LocalStorage:
      return localStorage;
    case StorageOption.SessionStorage:
      return sessionStorage;
  }

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
