import { NgModule, ModuleWithProviders } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import { NgxsStoragePlugin } from './storage.plugin';
import {
  NgxsStoragePluginOptions,
  NGXS_STORAGE_PLUGIN_OPTIONS,
  StorageOption,
  STORAGE_ENGINE,
  StorageEngine
} from './symbols';

export const defaultStoragePluginOptions: NgxsStoragePluginOptions = {
  key: '@@STATE',
  storage: StorageOption.LocalStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse
};

export function engineFactory(engine: StorageOption): StorageEngine {
  if (engine === StorageOption.LocalStorage) {
    return localStorage;
  } else if (engine === StorageOption.SessionStorage) {
    return sessionStorage;
  }

  return null;
}

@NgModule()
export class NgxsStoragePluginModule {
  static forRoot(options?: NgxsStoragePluginOptions): ModuleWithProviders {
    const combinedOptions = {
      ...defaultStoragePluginOptions,
      ...options
    };

    return {
      ngModule: NgxsStoragePluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsStoragePlugin,
          multi: true
        },
        {
          provide: NGXS_STORAGE_PLUGIN_OPTIONS,
          useValue: combinedOptions
        },
        {
          provide: STORAGE_ENGINE,
          useFactory: () => engineFactory(combinedOptions.storage)
        }
      ]
    };
  }
}
