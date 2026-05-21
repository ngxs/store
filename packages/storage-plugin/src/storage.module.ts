import {
  NgModule,
  ModuleWithProviders,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';
import { withNgxsPlugin } from '@ngxs/store';
import {
  ɵUSER_OPTIONS,
  STORAGE_ENGINE,
  ɵNGXS_STORAGE_PLUGIN_OPTIONS,
  NgxsStoragePluginOptions
} from '@ngxs/storage-plugin/internals';

import { NgxsStoragePlugin } from './storage.plugin';
import { engineFactory, storageOptionsFactory } from './internals';
import { ɵNgxsStoragePluginKeysManager } from './keys-manager';

/**
 * @deprecated Use `withNgxsStoragePlugin()` instead.
 */
@NgModule()
export class NgxsStoragePluginModule {
  /**
   * @deprecated Use `withNgxsStoragePlugin()` instead.
   */
  static forRoot(
    options: NgxsStoragePluginOptions
  ): ModuleWithProviders<NgxsStoragePluginModule> {
    return {
      ngModule: NgxsStoragePluginModule,
      providers: [
        ɵNgxsStoragePluginKeysManager,
        withNgxsPlugin(NgxsStoragePlugin),
        {
          provide: ɵUSER_OPTIONS,
          useValue: options
        },
        {
          provide: ɵNGXS_STORAGE_PLUGIN_OPTIONS,
          useFactory: storageOptionsFactory,
          deps: [ɵUSER_OPTIONS]
        },
        {
          provide: STORAGE_ENGINE,
          useFactory: engineFactory,
          deps: [ɵNGXS_STORAGE_PLUGIN_OPTIONS]
        }
      ]
    };
  }
}

export function withNgxsStoragePlugin(
  options: NgxsStoragePluginOptions
): EnvironmentProviders {
  return makeEnvironmentProviders([
    ɵNgxsStoragePluginKeysManager,
    withNgxsPlugin(NgxsStoragePlugin),
    {
      provide: ɵUSER_OPTIONS,
      useValue: options
    },
    {
      provide: ɵNGXS_STORAGE_PLUGIN_OPTIONS,
      useFactory: storageOptionsFactory,
      deps: [ɵUSER_OPTIONS]
    },
    {
      provide: STORAGE_ENGINE,
      useFactory: engineFactory,
      deps: [ɵNGXS_STORAGE_PLUGIN_OPTIONS]
    }
  ]);
}
