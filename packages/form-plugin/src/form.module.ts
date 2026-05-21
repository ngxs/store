import { NgModule, ModuleWithProviders, EnvironmentProviders } from '@angular/core';
import { withNgxsPlugin } from '@ngxs/store';

import { NgxsFormPlugin } from './form.plugin';
import { NgxsFormDirective } from './directive';

/**
 * @deprecated Use `withNgxsFormPlugin()` instead.
 */
@NgModule({
  imports: [NgxsFormDirective],
  exports: [NgxsFormDirective]
})
export class NgxsFormPluginModule {
  /**
   * @deprecated Use `withNgxsFormPlugin()` instead.
   */
  static forRoot(): ModuleWithProviders<NgxsFormPluginModule> {
    return {
      ngModule: NgxsFormPluginModule,
      providers: [withNgxsPlugin(NgxsFormPlugin)]
    };
  }
}

export function withNgxsFormPlugin(): EnvironmentProviders {
  return withNgxsPlugin(NgxsFormPlugin);
}
