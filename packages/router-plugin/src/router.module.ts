import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';
import { RouterState } from './router.state';

// NOTE: Must mark as `dynamic` due to
// https://github.com/dherges/ng-packagr/issues/767
export const NgxsModuleRouterState = NgxsModule.forFeature([RouterState]);

// @dynamic
@NgModule({
  imports: [NgxsModuleRouterState],
  providers: [{ provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer }]
})
export class NgxsRouterPluginModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: []
    };
  }
}
