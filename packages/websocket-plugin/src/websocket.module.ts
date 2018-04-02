import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsWebsocketPluginOptions, NGXS_WEBSOCKET_OPTIONS, configDefaults } from './symbols';
import { WebSocketHandler } from './websocket-handler';
import { WebSocketSubject } from './websocket-subject';
import { noop } from './symbols';

@NgModule({
  imports: [NgxsModule]
})
export class NgxsWebsocketPluginModule {
  static forRoot(options?: Partial<NgxsWebsocketPluginOptions>): ModuleWithProviders {
    return {
      ngModule: NgxsWebsocketPluginModule,
      providers: [
        WebSocketSubject,
        WebSocketHandler,
        {
          provide: NGXS_WEBSOCKET_OPTIONS,
          useValue: {
            ...configDefaults,
            ...options
          }
        },
        {
          provide: APP_INITIALIZER,
          useFactory: noop,
          deps: [WebSocketHandler],
          multi: true
        }
      ]
    };
  }
}
