import { NgModule, ModuleWithProviders, PLATFORM_ID, InjectionToken } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import {
  NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  NGXS_STORAGE_PLUGIN_OPTIONS
} from './symbols';
import { NgxsStoragePlugin } from './storage.plugin';
import { storageOptionsFactory, engineFactory } from './internals';

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');

@NgModule()
export class NgxsStoragePluginModule {
  static forRoot(
    options?: NgxsStoragePluginOptions
  ): ModuleWithProviders<NgxsStoragePluginModule> {
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
