import { ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';

import { NGXS_ROUTER_PLUGIN_OPTIONS, NgxsRouterPluginOptions } from './symbols';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';
import { RouterState } from './router.state';
import { NgxsModule } from '@ngxs/store';

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');
export function routerOptionsFactory(options: NgxsRouterPluginOptions) {
  return {
    ...options
  };
}

@NgModule({
  imports: [NgxsModule.forFeature([RouterState])]
})
export class NgxsRouterPluginModule {
  static forRoot(options?: NgxsRouterPluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: [
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_ROUTER_PLUGIN_OPTIONS,
          useFactory: routerOptionsFactory,
          deps: [USER_OPTIONS]
        },
        {
          provide: RouterStateSerializer,
          useClass: DefaultRouterStateSerializer
        }
      ]
    };
  }
}
