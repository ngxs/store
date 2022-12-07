import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { RouterState } from './router.state';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';
import {
  USER_OPTIONS,
  NGXS_ROUTER_PLUGIN_OPTIONS,
  NgxsRouterPluginOptions,
  createRouterPluginOptions
} from './symbols';

@NgModule({
  imports: [NgxsModule.forFeature([RouterState])]
})
export class NgxsRouterPluginModule {
  static forRoot(
    options?: NgxsRouterPluginOptions
  ): ModuleWithProviders<NgxsRouterPluginModule> {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: [
        { provide: USER_OPTIONS, useValue: options },
        {
          provide: NGXS_ROUTER_PLUGIN_OPTIONS,
          useFactory: createRouterPluginOptions,
          deps: [USER_OPTIONS]
        },
        { provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer }
      ]
    };
  }
}
