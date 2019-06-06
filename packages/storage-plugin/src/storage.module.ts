import { NgModule, ModuleWithProviders, PLATFORM_ID, InjectionToken } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { NGXS_PLUGINS } from '@ngxs/store';

import { NgxsStoragePlugin } from './storage.plugin';
import {
  NgxsStoragePluginOptions,
  NGXS_STORAGE_PLUGIN_OPTIONS,
  StorageOption,
  STORAGE_ENGINE,
  StorageEngine
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

export function engineFactory(
  options: NgxsStoragePluginOptions,
  platformId: any
): StorageEngine | null {
  if (isPlatformServer(platformId)) {
    return null;
  }

  if (options.storage === StorageOption.LocalStorage) {
    // todo: remove any here
    return <any>localStorage;
  } else if (options.storage === StorageOption.SessionStorage) {
    return <any>sessionStorage;
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
          deps: [NGXS_STORAGE_PLUGIN_OPTIONS, PLATFORM_ID]
        }
      ]
    };
  }
}
