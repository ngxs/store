import { NgModule, ModuleWithProviders } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NGXS_PLUGINS } from '@ngxs/store';

import { FormDirective } from './directive';
import { NgxsFormPlugin } from './form.plugin';
import { DefaultNgxsFormPluginValueChangesStrategy } from './value-changes-strategy';
import { NgxsFormPluginOptions, NGXS_FORM_PLUGIN_VALUE_CHANGES_STRATEGY } from './symbols';

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [FormDirective],
  exports: [FormDirective]
})
export class NgxsFormPluginModule {
  static forRoot(options: NgxsFormPluginOptions = {}): ModuleWithProviders {
    return {
      ngModule: NgxsFormPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsFormPlugin,
          multi: true
        },
        {
          provide: NGXS_FORM_PLUGIN_VALUE_CHANGES_STRATEGY,
          useClass: options.valueChangesStrategy || DefaultNgxsFormPluginValueChangesStrategy
        }
      ]
    };
  }
}
