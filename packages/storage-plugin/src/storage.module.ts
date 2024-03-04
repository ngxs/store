import {
  NgModule,
  ModuleWithProviders,
  PLATFORM_ID,
  InjectionToken,
  Injector,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';
import { NGXS_PLUGINS, withNgxsPlugin } from '@ngxs/store';
import {
  NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  ɵNGXS_STORAGE_PLUGIN_OPTIONS,
  ɵcreateFinalStoragePluginOptions,
  ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS
} from '@ngxs/storage-plugin/internals';

import { NgxsStoragePlugin } from './storage.plugin';
import { engineFactory, storageOptionsFactory } from './internals';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export const USER_OPTIONS = new InjectionToken(NG_DEV_MODE ? 'USER_OPTIONS' : '');

@NgModule()
export class NgxsStoragePluginModule {
  static forRoot(
    options: NgxsStoragePluginOptions
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
          provide: ɵNGXS_STORAGE_PLUGIN_OPTIONS,
          useFactory: storageOptionsFactory,
          deps: [USER_OPTIONS]
        },
        {
          provide: STORAGE_ENGINE,
          useFactory: engineFactory,
          deps: [ɵNGXS_STORAGE_PLUGIN_OPTIONS, PLATFORM_ID]
        },
        {
          provide: ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS,
          useFactory: ɵcreateFinalStoragePluginOptions,
          deps: [Injector, ɵNGXS_STORAGE_PLUGIN_OPTIONS]
        }
      ]
    };
  }
}

export function withNgxsStoragePlugin(
  options: NgxsStoragePluginOptions
): EnvironmentProviders {
  return makeEnvironmentProviders([
    withNgxsPlugin(NgxsStoragePlugin),
    {
      provide: USER_OPTIONS,
      useValue: options
    },
    {
      provide: ɵNGXS_STORAGE_PLUGIN_OPTIONS,
      useFactory: storageOptionsFactory,
      deps: [USER_OPTIONS]
    },
    {
      provide: STORAGE_ENGINE,
      useFactory: engineFactory,
      deps: [ɵNGXS_STORAGE_PLUGIN_OPTIONS, PLATFORM_ID]
    },
    {
      provide: ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS,
      useFactory: ɵcreateFinalStoragePluginOptions,
      deps: [Injector, ɵNGXS_STORAGE_PLUGIN_OPTIONS]
    }
  ]);
}
