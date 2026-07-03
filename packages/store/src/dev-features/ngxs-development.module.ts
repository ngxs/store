import { ModuleWithProviders, NgModule, makeEnvironmentProviders } from '@angular/core';
import {
  type ɵNgxsDevelopmentOptions,
  ɵNGXS_DEVELOPMENT_OPTIONS
} from '@ngxs/store/internals';

import { NgxsUnhandledActionsLogger } from './ngxs-unhandled-actions-logger';

/**
 * @deprecated Use `withNgxsDevelopmentOptions()` instead.
 */
@NgModule()
export class NgxsDevelopmentModule {
  /**
   * @deprecated Use `withNgxsDevelopmentOptions()` instead.
   */
  static forRoot(
    options: ɵNgxsDevelopmentOptions
  ): ModuleWithProviders<NgxsDevelopmentModule> {
    return {
      ngModule: NgxsDevelopmentModule,
      providers: [
        NgxsUnhandledActionsLogger,
        { provide: ɵNGXS_DEVELOPMENT_OPTIONS, useValue: options }
      ]
    };
  }
}

export function withNgxsDevelopmentOptions(options: ɵNgxsDevelopmentOptions) {
  return makeEnvironmentProviders([
    NgxsUnhandledActionsLogger,
    { provide: ɵNGXS_DEVELOPMENT_OPTIONS, useValue: options }
  ]);
}
