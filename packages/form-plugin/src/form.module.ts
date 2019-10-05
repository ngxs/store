import { NgModule, ModuleWithProviders } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NGXS_PLUGINS } from '@ngxs/store';

import { FormDirective } from './directive';
import { NgxsFormPlugin } from './form.plugin';
import {
  NoopNgxsFormPluginValueChangesStrategy,
  DeepEqualNgxsFormPluginValueChangesStrategy
} from './value-changes-strategy';

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [FormDirective],
  exports: [FormDirective]
})
export class NgxsFormPluginModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsFormPluginModule,
      providers: [
        NoopNgxsFormPluginValueChangesStrategy,
        DeepEqualNgxsFormPluginValueChangesStrategy,
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsFormPlugin,
          multi: true
        }
      ]
    };
  }
}
