import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';
import { RouterState } from './router.state';

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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsRouterPluginModule
    };
  }
}
