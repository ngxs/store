import { APP_INITIALIZER } from '@angular/core';

import { WebSocketHandler } from './websocket-handler';
import { USER_OPTIONS, NGXS_WEBSOCKET_OPTIONS, NgxsWebsocketPluginOptions } from './symbols';

export function ɵwebsocketOptionsFactory(options: NgxsWebsocketPluginOptions) {
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

export function ɵgetProviders(options?: NgxsWebsocketPluginOptions) {
  return [
    { provide: USER_OPTIONS, useValue: options },
    {
      provide: NGXS_WEBSOCKET_OPTIONS,
      useFactory: ɵwebsocketOptionsFactory,
      deps: [USER_OPTIONS]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [WebSocketHandler],
      multi: true
    }
  ];
}
