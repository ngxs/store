import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import {
  NgxsRouterPluginOptions,
  ɵcreateRouterPluginOptions,
  ɵNGXS_ROUTER_PLUGIN_OPTIONS,
  ɵUSER_OPTIONS
} from '@ngxs/router-plugin/internals';

import { RouterState } from './router.state';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';

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
        { provide: ɵUSER_OPTIONS, useValue: options },
        {
          provide: ɵNGXS_ROUTER_PLUGIN_OPTIONS,
          useFactory: ɵcreateRouterPluginOptions,
          deps: [ɵUSER_OPTIONS]
        },
        { provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer }
      ]
    };
  }
}
