import { ModuleWithProviders, NgModule } from '@angular/core';

import { NGXS_ROUTER_PLUGIN_OPTIONS, NgxsRouterPluginOptions } from './symbols';
import { DefaultRouterStateSerializer, RouterStateSerializer } from './serializer';
import { RouterState } from './router.state';
import { StateFactory } from '@ngxs/store/src/state-factory';
import { StateStream } from '@ngxs/store';

export const defaultRouterStateOptions: NgxsRouterPluginOptions = {};

@NgModule()
export class NgxsRouterPluginModule {
  static forRoot(options?: NgxsRouterPluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsRouterPluginModule,
      providers: [
        {
          provide: NGXS_ROUTER_PLUGIN_OPTIONS,
          useValue: {
            ...defaultRouterStateOptions,
            ...options
          }
        },
        { provide: RouterStateSerializer, useClass: DefaultRouterStateSerializer },
        RouterState
      ]
    };
  }

  constructor(factory: StateFactory, stateStream: StateStream) {
    const results = factory.addAndReturnDefaults([RouterState]);
    if (results) {
      // get our current stream
      const cur = stateStream.getValue();

      // set the state to the current + new
      stateStream.next({ ...cur, ...results.defaults });
    }
  }
}
