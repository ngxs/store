import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';
import { RouterState } from './router.state';

export const routerFeatureModule = NgxsModule.forFeature([RouterState]);

@NgModule({
  imports: [routerFeatureModule]
})
export class NgxsRouterPluginModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: [{ provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer }]
    };
  }
}
