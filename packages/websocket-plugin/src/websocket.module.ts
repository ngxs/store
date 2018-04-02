import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsWebsocketPluginOptions, NGXS_WEBSOCKET_OPTIONS, configDefaults } from './symbols';
import { WebSocketHandler } from './websocket-handler';
import { WebSocketSubject } from './websocket-subject';

@NgModule({
  imports: [NgxsModule]
})
export class NgxsReduxDevtoolsPluginModule {
  static forRoot(options?: NgxsWebsocketPluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsReduxDevtoolsPluginModule,
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
          useFactory: (handler: WebSocketHandler) => () => {},
          deps: [WebSocketHandler],
          multi: true
        }
      ]
    };
  }
}
