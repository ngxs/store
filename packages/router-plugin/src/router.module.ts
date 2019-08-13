import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { RouterState } from './router.state';
import { RouterFactory } from './router-factory';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';

// @dynamic
@NgModule({
  imports: [
    // NOTE: Must mark as `dynamic` due to
    // https://github.com/dherges/ng-packagr/issues/767
    NgxsModule.forFeature([RouterState])
  ],
  providers: [{ provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer }]
})
export class NgxsRouterPluginModule {
  constructor(_routerFactory: RouterFactory) {}

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: [RouterFactory]
    };
  }
}
