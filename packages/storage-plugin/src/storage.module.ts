import { NgModule, ModuleWithProviders } from '@angular/core';

import { NGXS_PLUGINS } from '@ngxs/store';
import { NgxsStoragePlugin } from './storage.plugin';
import { NgxsStoragePluginOptions, NGXS_STORAGE_PLUGIN_OPTIONS } from './symbols';

export const defaultStoragePluginOptions: NgxsStoragePluginOptions = {
  key: '@@STATE',
  storage: localStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse
};

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
          provide: NGXS_STORAGE_PLUGIN_OPTIONS,
          useValue: {
            ...defaultStoragePluginOptions,
            ...options
          }
        }
      ]
    };
  }
}
