import { InjectionToken } from '@angular/core';

export const NGXS_WEBSOCKET_OPTIONS = new InjectionToken('NGXS_WEBSOCKET_OPTIONS');
export const configDefaults: Partial<NgxsWebsocketPluginOptions> = {
  reconnectInterval: 5000,
  reconnectAttempts: 10,
  typeKey: 'type',
  serializer: JSON.stringify
};

export interface NgxsWebsocketPluginOptions {
  url: string;
  typeKey?: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  serializer?: (data: any) => string;
}

export function noop(arg) {
  return function() {};
}

export class ConnectWebSocket {
  static readonly type = '[Websocket] Connect';
}
export class DisconnectWebSocket {
  static readonly type = '[Websocket] Disconnect';
}
export class SendWebSocketMessage {
  static readonly type = '[Websocket] Send Message';
  constructor(public payload: any) {}
}
