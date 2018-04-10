import { NgModule, ModuleWithProviders, APP_INITIALIZER, InjectionToken } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsWebsocketPluginOptions, NGXS_WEBSOCKET_OPTIONS } from './symbols';
import { WebSocketHandler } from './websocket-handler';
import { WebSocketSubject } from './websocket-subject';
import { noop } from './symbols';

export function websocketOptionsFactory(options: NgxsWebsocketPluginOptions) {
  return {
    reconnectInterval: 5000,
    reconnectAttempts: 10,
    typeKey: 'type',
    deserializer(e: MessageEvent) {
      return JSON.parse(e.data);
    },
    serializer(value: any) {
      return JSON.stringify(value);
    },
    ...options
  };
}

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');

@NgModule({
  imports: [NgxsModule]
})
export class NgxsWebsocketPluginModule {
  static forRoot(options?: NgxsWebsocketPluginOptions): ModuleWithProviders {
    return {
      ngModule: NgxsWebsocketPluginModule,
      providers: [
        WebSocketSubject,
        WebSocketHandler,
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_WEBSOCKET_OPTIONS,
          useFactory: websocketOptionsFactory,
          deps: [USER_OPTIONS]
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
