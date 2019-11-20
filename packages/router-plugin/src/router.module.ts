import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { RouterState } from './router.state';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';

@NgModule()
export class NgxsRouterPluginModule {
  static forRoot(): ModuleWithProviders[] {
    return [
      NgxsModule.forFeature([RouterState]),
      {
        ngModule: NgxsRouterPluginModule,
        providers: [{ provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer }]
      }
    ];
  }
}
