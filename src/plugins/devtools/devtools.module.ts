import { NgModule, ModuleWithProviders } from '@angular/core';

import { NGXS_PLUGINS } from '../../lib/symbols';

import { DevtoolsOptions, DEVTOOLS_OPTIONS } from './symbols';
import { ReduxDevtoolsPlugin } from './devtools.plugin';

@NgModule()
export class ReduxDevtoolsPluginModule {
  static forRoot(options?: DevtoolsOptions): ModuleWithProviders {
    return {
      ngModule: ReduxDevtoolsPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: ReduxDevtoolsPlugin,
          multi: true
        },
        {
          provide: DEVTOOLS_OPTIONS,
          useValue: options
        }
      ]
    };
  }
}
