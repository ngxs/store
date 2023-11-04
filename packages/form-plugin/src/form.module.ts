import {
  NgModule,
  ModuleWithProviders,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';
import { NGXS_PLUGINS, withNgxsPlugin } from '@ngxs/store';

import { NgxsFormPlugin } from './form.plugin';
import { NgxsFormDirective } from './directive';

@NgModule({
  imports: [NgxsFormDirective],
  exports: [NgxsFormDirective]
})
export class NgxsFormPluginModule {
  static forRoot(): ModuleWithProviders<NgxsFormPluginModule> {
    return {
      ngModule: NgxsFormPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsFormPlugin,
          multi: true
        }
      ]
    };
  }
}

export function withNgxsFormPlugin(): EnvironmentProviders {
  return makeEnvironmentProviders([withNgxsPlugin(NgxsFormPlugin)]);
}
