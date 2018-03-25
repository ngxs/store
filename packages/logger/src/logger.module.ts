import { NgModule, ModuleWithProviders } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';
import { NgxsLoggerPluginOptions, NGXS_LOGGER_PLUGIN_OPTIONS } from './symbols';
import { NgxsLoggerPlugin } from './logger.plugin';

@NgModule()
export class NgxsLoggerPluginModule {
  static forRoot(options: NgxsLoggerPluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsLoggerPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsLoggerPlugin,
          multi: true
        },
        {
          provide: NGXS_LOGGER_PLUGIN_OPTIONS,
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
