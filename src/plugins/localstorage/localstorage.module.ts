import { NgModule, ModuleWithProviders } from '@angular/core';

import { NGXS_PLUGINS } from '../../symbols';
import { LocalStoragePlugin } from './localstorage.plugin';
import { serialize, deserialize } from './utils';
import { LocalStoragePluginOptions, LOCAL_STORAGE_PLUGIN_OPTIONS, StorageStrategy } from './symbols';

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
            strategy: options.strategy || StorageStrategy.localstorage,
            serialize: options.serialize || serialize,
            deserialize: options.deserialize || deserialize
          }
        }
      ]
    };
  }
}
