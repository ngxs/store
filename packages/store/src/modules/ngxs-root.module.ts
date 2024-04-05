import { NgModule } from '@angular/core';

import { rootStoreInitializer } from '../standalone-features/initializers';

/**
 * @ignore
 */
@NgModule()
export class NgxsRootModule {
  constructor() {
    rootStoreInitializer();
  }
}
