import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxsModule, NGXS_PLUGINS } from '@ngxs/store';

import { NgxsDevtoolsOptions, NGXS_DEVTOOLS_OPTIONS } from './symbols';
import { NgxsReduxDevtoolsPlugin } from './devtools.plugin';

export const defaultNgxsDevtoolsOptions: NgxsDevtoolsOptions = {
  name: 'NGXS'
};

@NgModule({
  imports: [NgxsModule]
})
export class NgxsReduxDevtoolsPluginModule {
  static forRoot(options?: NgxsDevtoolsOptions): ModuleWithProviders {
    return {
      ngModule: NgxsReduxDevtoolsPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsReduxDevtoolsPlugin,
          multi: true
        },
        {
          provide: NGXS_DEVTOOLS_OPTIONS,
          useValue: {
            ...defaultNgxsDevtoolsOptions,
            ...options
          }
        }
      ]
    };
  }
}
