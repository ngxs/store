import { NgModule, ModuleWithProviders } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';
import { NgxsFormPlugin } from './form.plugin';
import { ReactiveFormsModule } from '@angular/forms';
import { FormDirective } from './directive';

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [FormDirective],
  exports: [FormDirective]
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
