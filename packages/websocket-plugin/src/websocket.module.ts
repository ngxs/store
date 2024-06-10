import {
  NgModule,
  ModuleWithProviders,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';

import { ɵgetProviders } from './providers';
import { NgxsWebSocketPluginOptions } from './symbols';

@NgModule()
export class NgxsWebSocketPluginModule {
  static forRoot(
    options?: NgxsWebSocketPluginOptions
  ): ModuleWithProviders<NgxsWebSocketPluginModule> {
    return {
      ngModule: NgxsWebSocketPluginModule,
      providers: ɵgetProviders(options)
    };
  }
}

export function withNgxsWebSocketPlugin(
  options?: NgxsWebSocketPluginOptions
): EnvironmentProviders {
  return makeEnvironmentProviders(ɵgetProviders(options));
}
