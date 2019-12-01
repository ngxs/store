import { NgModule, ModuleWithProviders, APP_INITIALIZER, InjectionToken } from '@angular/core';

import { WebSocketHandler } from './websocket-handler';
import { NgxsWebsocketPluginOptions, NGXS_WEBSOCKET_OPTIONS, noop } from './symbols';

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

@NgModule()
export class NgxsWebsocketPluginModule {
  static forRoot(
    options?: NgxsWebsocketPluginOptions
  ): ModuleWithProviders<NgxsWebsocketPluginModule> {
    return {
      ngModule: NgxsWebsocketPluginModule,
      providers: [
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
