import { NgModule } from '@angular/core';

import { featureStatesInitializer } from '../standalone-features/initializers';

/**
 * @ignore
 */
@NgModule()
export class NgxsFeatureModule {
  constructor() {
    featureStatesInitializer();
  }
}
