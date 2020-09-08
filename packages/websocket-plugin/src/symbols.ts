import { InjectionToken } from '@angular/core';

export const NGXS_WEBSOCKET_OPTIONS = new InjectionToken('NGXS_WEBSOCKET_OPTIONS');

export interface NgxsWebsocketPluginOptions {
  /**
   * URL of the websocket.
   */
  url?: string;

  /**
   * Either a single protocol string or an array of protocol strings.
   * These strings are used to indicate sub-protocols, so that a single server
   * can implement multiple WebSocket sub-protocols (for example, you might want one server to be able
   * to handle different types of interactions depending on the specified protocol).
   * If you don't specify a protocol string, an empty string is assumed.
   */
  protocol?: string | string[];

  /**
   * Sets the `binaryType` property of the underlying WebSocket.
   */
  binaryType?: 'blob' | 'arraybuffer';

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

export function noop(..._args: any[]) {
  return function() {};
}

/**
 * Action to connect to the websocket. Optionally pass a URL.
 */
export class ConnectWebSocket {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[WebSocket] Connect';
  }
  constructor(public payload?: NgxsWebsocketPluginOptions) {}
}

/**
 * Action triggered when a error ocurrs
 */
export class WebsocketMessageError {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[WebSocket] Message Error';
  }
  constructor(public payload: any) {}
}

/**
 * Action to disconnect the websocket.
 */
export class DisconnectWebSocket {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[WebSocket] Disconnect';
  }
}

/**
 * Action triggered when websocket is connected
 */
export class WebSocketConnected {
  static get type() {
    return '[WebSocket] Connected';
  }
}

/**
 * Action triggered when websocket is disconnected
 */
export class WebSocketDisconnected {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[WebSocket] Disconnected';
  }
}

/**
 * Action to send to the server.
 */
export class SendWebSocketMessage {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[WebSocket] Send Message';
  }
  constructor(public payload: any) {}
}

/**
 * Action dispatched when the user tries to connect if the connection already exists.
 */
export class WebSocketConnectionUpdated {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[WebSocket] Connection Updated';
  }
}

/**
 * This error is thrown where there is no `type` (or custom `typeKey`) property
 * on the message that came from the server side socket
 */
export class TypeKeyPropertyMissingError extends Error {
  constructor(typeKey: string) {
    super(`Property ${typeKey} is missing on the socket message`);
  }
}
