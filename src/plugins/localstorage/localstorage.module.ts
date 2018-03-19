import { NgModule, ModuleWithProviders } from '@angular/core';

import { NGXS_PLUGINS } from '../../symbols';
import { NgxsLocalStoragePlugin } from './localstorage.plugin';
import { serialize, deserialize } from './utils';
import { NgxsLocalStoragePluginOptions, NGXS_LOCAL_STORAGE_PLUGIN_OPTIONS } from './symbols';

@NgModule()
export class NgxsLocalStoragePluginModule {
  static forRoot(options: NgxsLocalStoragePluginOptions = {}): ModuleWithProviders {
    return {
      ngModule: NgxsLocalStoragePluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsLocalStoragePlugin,
          multi: true
        },
        {
          provide: NGXS_LOCAL_STORAGE_PLUGIN_OPTIONS,
          useValue: {
            key: options.key || '@@STATE',
            storage: localStorage,
            serialize: options.serialize || serialize,
            deserialize: options.deserialize || deserialize
          }
        }
      ]
    };
  }
}
