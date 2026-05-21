import {
  NgModule,
  ModuleWithProviders,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';

import { ɵgetProviders } from './providers';
import { NgxsWebSocketPluginOptions } from './symbols';

/**
 * @deprecated Use `withNgxsWebSocketPlugin()` instead.
 */
@NgModule()
export class NgxsWebSocketPluginModule {
  /**
   * @deprecated Use `withNgxsWebSocketPlugin()` instead.
   */
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
