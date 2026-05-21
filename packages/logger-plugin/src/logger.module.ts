import {
  EnvironmentProviders,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  makeEnvironmentProviders
} from '@angular/core';
import { withNgxsPlugin } from '@ngxs/store';

import { NgxsLoggerPlugin } from './logger.plugin';
import { NgxsLoggerPluginOptions, NGXS_LOGGER_PLUGIN_OPTIONS } from './symbols';

export const USER_OPTIONS = new InjectionToken('LOGGER_USER_OPTIONS');

export function loggerOptionsFactory(options: NgxsLoggerPluginOptions) {
  const defaultLoggerOptions: NgxsLoggerPluginOptions = {
    logger: console,
    collapsed: false,
    disabled: false,
    filter: () => true
  };

  return {
    ...defaultLoggerOptions,
    ...options
  };
}

/**
 * @deprecated Use `withNgxsLoggerPlugin()` instead.
 */
@NgModule()
export class NgxsLoggerPluginModule {
  /**
   * @deprecated Use `withNgxsLoggerPlugin()` instead.
   */
  static forRoot(
    options?: NgxsLoggerPluginOptions
  ): ModuleWithProviders<NgxsLoggerPluginModule> {
    return {
      ngModule: NgxsLoggerPluginModule,
      providers: [
        withNgxsPlugin(NgxsLoggerPlugin),
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_LOGGER_PLUGIN_OPTIONS,
          useFactory: loggerOptionsFactory,
          deps: [USER_OPTIONS]
        }
      ]
    };
  }
}

export function withNgxsLoggerPlugin(options?: NgxsLoggerPluginOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    withNgxsPlugin(NgxsLoggerPlugin),
    { provide: USER_OPTIONS, useValue: options },
    {
      provide: NGXS_LOGGER_PLUGIN_OPTIONS,
      useFactory: loggerOptionsFactory,
      deps: [USER_OPTIONS]
    }
  ]);
}
