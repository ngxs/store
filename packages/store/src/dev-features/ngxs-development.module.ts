import { ModuleWithProviders, NgModule, makeEnvironmentProviders } from '@angular/core';

import { NgxsDevelopmentOptions, NGXS_DEVELOPMENT_OPTIONS } from './symbols';
import { NgxsUnhandledActionsLogger } from './ngxs-unhandled-actions-logger';

@NgModule()
export class NgxsDevelopmentModule {
  static forRoot(options: NgxsDevelopmentOptions): ModuleWithProviders<NgxsDevelopmentModule> {
    return {
      ngModule: NgxsDevelopmentModule,
      providers: [
        NgxsUnhandledActionsLogger,
        { provide: NGXS_DEVELOPMENT_OPTIONS, useValue: options }
      ]
    };
  }
}

export function withNgxsDevelopmentOptions(options: NgxsDevelopmentOptions) {
  return makeEnvironmentProviders([
    NgxsUnhandledActionsLogger,
    { provide: NGXS_DEVELOPMENT_OPTIONS, useValue: options }
  ]);
}
