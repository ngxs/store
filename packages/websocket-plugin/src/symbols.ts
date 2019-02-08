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

  /**
   * Deseralizer before publishing the message.
   */
  deserializer?: (e: MessageEvent) => any;
}

export function noop(...args: any[]) {
  return function() {};
}

/**
 * Action to connect to the websocket. Optionally pass a URL.
 */
export class ConnectWebSocket {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Websocket] Connect';
  }
  constructor(public payload?: NgxsWebsocketPluginOptions) {}
}

/**
 * Action triggered when a error ocurrs
 */
export class WebsocketMessageError {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Websocket] Message Error';
  }
  constructor(public payload: any) {}
}

/**
 * Action to disconnect the websocket.
 */
export class DisconnectWebSocket {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Websocket] Disconnect';
  }
}

/**
 * Action triggered when websocket is disconnected
 */
export class WebSocketDisconnected {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Websocket] Disconnected';
  }
}

/**
 * Action to send to the server.
 */
export class SendWebSocketMessage {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Websocket] Send Message';
  }
  constructor(public payload: any) {}
}
