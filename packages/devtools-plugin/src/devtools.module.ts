import {
  NgModule,
  ModuleWithProviders,
  InjectionToken,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';
import { withNgxsPlugin } from '@ngxs/store';
import { NGXS_PLUGINS } from '@ngxs/store/plugins';

import { NgxsDevtoolsOptions, NGXS_DEVTOOLS_OPTIONS } from './symbols';
import { NgxsReduxDevtoolsPlugin } from './devtools.plugin';

export function devtoolsOptionsFactory(options: NgxsDevtoolsOptions) {
  return {
    name: 'NGXS',
    ...options
  };
}

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');

@NgModule()
export class NgxsReduxDevtoolsPluginModule {
  static forRoot(
    options?: NgxsDevtoolsOptions
  ): ModuleWithProviders<NgxsReduxDevtoolsPluginModule> {
    return {
      ngModule: NgxsReduxDevtoolsPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsReduxDevtoolsPlugin,
          multi: true
        },
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_DEVTOOLS_OPTIONS,
          useFactory: devtoolsOptionsFactory,
          deps: [USER_OPTIONS]
        }
      ]
    };
  }
}

export function withNgxsReduxDevtoolsPlugin(
  options?: NgxsDevtoolsOptions
): EnvironmentProviders {
  return makeEnvironmentProviders([
    withNgxsPlugin(NgxsReduxDevtoolsPlugin),
    {
      provide: USER_OPTIONS,
      useValue: options
    },
    {
      provide: NGXS_DEVTOOLS_OPTIONS,
      useFactory: devtoolsOptionsFactory,
      deps: [USER_OPTIONS]
    }
  ]);
}
