import { NgModule, ModuleWithProviders, InjectionToken, PLATFORM_ID } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import { NgxsAsyncStoragePluginOptions, NGXS_ASYNC_STORAGE_PLUGIN_OPTIONS } from './symbols';
import { NgxsAsyncStoragePlugin } from './async-storage.plugin';
import { storageOptionsFactory } from './internals';

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');

@NgModule()
export class NgxsAsyncStoragePluginModule {
  static forRoot(
    options?: NgxsAsyncStoragePluginOptions
  ): ModuleWithProviders<NgxsAsyncStoragePluginModule> {
    return {
      ngModule: NgxsAsyncStoragePluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsAsyncStoragePlugin,
          multi: true
        },
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_ASYNC_STORAGE_PLUGIN_OPTIONS,
          useFactory: storageOptionsFactory,
          deps: [USER_OPTIONS, PLATFORM_ID]
        }
      ]
    };
  }
}
