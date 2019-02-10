import { ModuleWithProviders, NgModule } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';
import { NgxsResetPlugin } from './reset.plugin';

@NgModule()
export class NgxsResetPluginModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsResetPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsResetPlugin,
          multi: true
        }
      ]
    };
  }
}
