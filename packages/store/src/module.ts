import { ModuleWithProviders, NgModule } from '@angular/core';
import { ɵStateClass } from '@ngxs/store/internals';

import { NgxsModuleOptions } from './symbols';
import { NgxsRootModule } from './modules/ngxs-root.module';
import { NgxsFeatureModule } from './modules/ngxs-feature.module';
import { getRootProviders } from './standalone-features/root-providers';
import { getFeatureProviders } from './standalone-features/feature-providers';

/**
 * @deprecated Use `provideStore()` and `provideStates()` instead.
 */
@NgModule()
export class NgxsModule {
  /**
   * @deprecated Use `provideStore()` instead.
   */
  static forRoot(
    states: ɵStateClass[] = [],
    options: NgxsModuleOptions = {}
  ): ModuleWithProviders<NgxsRootModule> {
    return {
      ngModule: NgxsRootModule,
      providers: getRootProviders(states, options)
    };
  }

  /**
   * @deprecated Use `provideStates()` instead.
   */
  static forFeature(states: ɵStateClass[] = []): ModuleWithProviders<NgxsFeatureModule> {
    return {
      ngModule: NgxsFeatureModule,
      providers: getFeatureProviders(states)
    };
  }
}
