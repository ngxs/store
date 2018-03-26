import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxsModule, NGXS_PLUGINS } from '@ngxs/store';

import { NgxsDevtoolsOptions, NGXS_DEVTOOLS_OPTIONS } from './symbols';
import { NgxsReduxDevtoolsPlugin } from './devtools.plugin';

@NgModule({
  imports: [NgxsModule]
})
export class NgxsReduxDevtoolsPluginModule {
  static forRoot(options?: NgxsDevtoolsOptions): ModuleWithProviders {
    return {
      ngModule: NgxsReduxDevtoolsPluginModule,
      providers: [
        { provide: NGXS_PLUGINS, useClass: NgxsReduxDevtoolsPlugin, multi: true },
        { provide: NGXS_DEVTOOLS_OPTIONS, useValue: options ? options : {} }
      ]
    };
  }
}
