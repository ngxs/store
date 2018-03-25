import { NgModule, ModuleWithProviders } from '@angular/core';

import { NGXS_PLUGINS } from '../../symbols';
import { NgxsStoragePlugin } from './storage.plugin';
import { serialize, deserialize } from './utils';
import { NgxsStoragePluginOptions, NGXS_STORAGE_PLUGIN_OPTIONS, NgxStorageStrategy } from './symbols';

@NgModule()
export class NgxsStoragePluginModule {
  static forRoot(options: NgxsStoragePluginOptions = {}): ModuleWithProviders {
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
            key: options.key || '@@STATE',
            storage: options.storage || NgxStorageStrategy.localStorage,
            serialize: options.serialize || serialize,
            deserialize: options.deserialize || deserialize
          }
        }
      ]
    };
  }
}
