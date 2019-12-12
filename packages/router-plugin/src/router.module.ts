import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { RouterState } from './router.state';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';

@NgModule({
  imports: [NgxsModule.forFeature([RouterState])]
})
export class NgxsRouterPluginModule {
  static forRoot(): ModuleWithProviders<NgxsRouterPluginModule> {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: [{ provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer }]
    };
  }
}
