import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

import { NgxsLoggerPluginOptions, NGXS_LOGGER_PLUGIN_OPTIONS } from './symbols';
import { NgxsLoggerPlugin } from './logger.plugin';

export const USER_OPTIONS = new InjectionToken('LOGGER_USER_OPTIONS');

export function loggerOptionsFactory(options: NgxsLoggerPluginOptions) {
  const defaultLoggerOptions: NgxsLoggerPluginOptions = {
    logger: console,
    collapsed: false,
    disabled: false
  };

  return {
    ...defaultLoggerOptions,
    ...options
  };
}

@NgModule()
export class NgxsLoggerPluginModule {
  static forRoot(
    options?: NgxsLoggerPluginOptions
  ): ModuleWithProviders<NgxsLoggerPluginModule> {
    return {
      ngModule: NgxsLoggerPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsLoggerPlugin,
          multi: true
        },
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
