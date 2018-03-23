import { NgModule, ModuleWithProviders } from "@angular/core";
import { NGXS_PLUGINS } from "../../symbols";
import { NgxsFormPlugin } from "./form.plugin";
import { ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '../../module';
import { FormDirective } from './directive';


@NgModule({
  imports: [ReactiveFormsModule, NgxsModule],
  declarations: [FormDirective],
  exports: [FormDirective]
})
export class NgxsFormPluginModule {
  static forRoot(): ModuleWithProviders {
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
