import {
  NgModule,
  ModuleWithProviders,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';

import { ɵgetProviders } from './providers';
import { NgxsWebsocketPluginOptions } from './symbols';

@NgModule()
export class NgxsWebsocketPluginModule {
  static forRoot(
    options?: NgxsWebsocketPluginOptions
  ): ModuleWithProviders<NgxsWebsocketPluginModule> {
    return {
      ngModule: NgxsWebsocketPluginModule,
      providers: ɵgetProviders(options)
    };
  }
}

export function withNgxsWebSocketPlugin(
  options?: NgxsWebsocketPluginOptions
): EnvironmentProviders {
  return makeEnvironmentProviders(ɵgetProviders(options));
}
