import { NgModule, ModuleWithProviders } from '@angular/core';
import { NGXS_PLUGINS } from '../../symbols';
import { NgxsDevtoolsOptions, NGXS_DEVTOOLS_OPTIONS } from './symbols';
import { NgxsReduxDevtoolsPlugin } from './devtools.plugin';
import { NgxsModule } from '../../module';

@NgModule({
  imports: [NgxsModule]
})
export class NgxsReduxDevtoolsPluginModule {
  static forRoot(options?: NgxsDevtoolsOptions): ModuleWithProviders {
    return {
      ngModule: NgxsReduxDevtoolsPluginModule,
      providers: [
        { provide: NGXS_PLUGINS, useClass: NgxsReduxDevtoolsPlugin, multi: true },
        { provide: NGXS_DEVTOOLS_OPTIONS, useValue: options }
      ]
    };
  }
}
