import {
  NgModule,
  ModuleWithProviders,
  PLATFORM_ID,
  InjectionToken,
  Injector
} from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import {
  NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  NGXS_STORAGE_PLUGIN_OPTIONS
} from './symbols';
import { NgxsStoragePlugin } from './storage.plugin';
import { engineFactory, storageOptionsFactory } from './internals';
import {
  createFinalStoragePluginOptions,
  FINAL_NGXS_STORAGE_PLUGIN_OPTIONS
} from './internals/final-options';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export const USER_OPTIONS = new InjectionToken(NG_DEV_MODE ? 'USER_OPTIONS' : '');

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
        },
        {
          provide: FINAL_NGXS_STORAGE_PLUGIN_OPTIONS,
          useFactory: createFinalStoragePluginOptions,
          deps: [Injector, NGXS_STORAGE_PLUGIN_OPTIONS]
        }
      ]
    };
  }
}
