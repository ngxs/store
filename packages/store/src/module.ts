import { ModuleWithProviders, NgModule } from '@angular/core';
import { ɵStateClass } from '@ngxs/store/internals';

import { NgxsModuleOptions } from './symbols';
import { NgxsRootModule } from './modules/ngxs-root.module';
import { NgxsFeatureModule } from './modules/ngxs-feature.module';
import { getRootProviders } from './standalone-features/root-providers';
import { getFeatureProviders } from './standalone-features/feature-providers';

@NgModule()
export class NgxsModule {
  static forRoot(
    states: ɵStateClass[] = [],
    options: NgxsModuleOptions = {}
  ): ModuleWithProviders<NgxsRootModule> {
    return {
      ngModule: NgxsRootModule,
      providers: getRootProviders(states, options)
    };
  }

  static forFeature(states: ɵStateClass[] = []): ModuleWithProviders<NgxsFeatureModule> {
    return {
      ngModule: NgxsFeatureModule,
      providers: getFeatureProviders(states)
    };
  }
}
