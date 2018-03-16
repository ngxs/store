import { NgModule, ModuleWithProviders } from '@angular/core';

import { NGXS_PLUGINS } from '../../lib/symbols';

import { LoggerPluginOptions, LOGGER_PLUGIN_OPTIONS } from './symbols';
import { LoggerPlugin } from './logger.plugin';

@NgModule()
export class LoggerPluginModule {
  static forRoot(options: LoggerPluginOptions): ModuleWithProviders {
    return {
      ngModule: LoggerPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: LoggerPlugin,
          multi: true
        },
        {
          provide: LOGGER_PLUGIN_OPTIONS,
          useValue: {
            ...{
              logger: console,
              collapsed: false
            },
            ...options
          }
        }
      ]
    };
  }
}
