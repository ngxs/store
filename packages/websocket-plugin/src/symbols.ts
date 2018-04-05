import { InjectionToken } from '@angular/core';

export const NGXS_WEBSOCKET_OPTIONS = new InjectionToken('NGXS_WEBSOCKET_OPTIONS');

export interface NgxsWebsocketPluginOptions {
  /**
   * URL of the websocket.
   */
  url?: string;

  /**
   * The property name to distigunish this type for the store.
   * Default: 'type'
   */
  typeKey?: string;

  /**
   * Interval to try and reconnect.
   * Default: 5000
   */
  reconnectInterval?: number;

  /**
   * Number of reconnect attemps.
   * Default: 10
   */
  reconnectAttempts?: number;

  /**
   * Serializer to call before sending messages
   * Default: `json.stringify`
   */
  serializer?: (data: any) => string;
}

export function noop(arg) {
  return function() {};
}

/**
 * Action to connect to the websocket. Optionally pass a URL.
 */
export class ConnectWebSocket {
  static readonly type = '[Websocket] Connect';
  constructor(public payload?: string) {}
}

/**
 * Action triggered when a error ocurrs
 */
export class WebsocketMessageError {
  static readonly type = '[Websocket] Message Error';
  constructor(public payload: any) {}
}

/**
 * Action to disconnect the websocket.
 */
export class DisconnectWebSocket {
  static readonly type = '[Websocket] Disconnect';
}

/**
 * Action to send to the server.
 */
export class SendWebSocketMessage {
  static readonly type = '[Websocket] Send Message';
  constructor(public payload: any) {}
}
