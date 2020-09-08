import { Injectable, Inject } from '@angular/core';
import { Actions, Store, getValue, ofActionDispatched } from '@ngxs/store';

import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';

import {
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage,
  NGXS_WEBSOCKET_OPTIONS,
  NgxsWebsocketPluginOptions,
  WebsocketMessageError,
  WebSocketDisconnected,
  TypeKeyPropertyMissingError,
  WebSocketConnectionUpdated,
  WebSocketConnected
} from './symbols';

@Injectable()
export class WebSocketHandler {
  private socket: WebSocketSubject<any> | null = null;

  private config: WebSocketSubjectConfig<any> = {
    url: this.options.url!,
    protocol: this.options.protocol,
    // Default binary type is `blob` for the global `WebSocket`
    binaryType: this.options.binaryType,
    serializer: this.options.serializer,
    deserializer: this.options.deserializer,
    closeObserver: {
      next: () => {
        // ATTENTION!
        // See https://github.com/ReactiveX/rxjs/blob/master/src/internal/observable/dom/WebSocketSubject.ts#L340
        // RxJS socket emits `onComplete` event only if `event.wasClean` is truthy
        // and doesn't complete socket subject if it's falsy
        this.disconnect();
      }
    },
    openObserver: {
      next: () => this.store.dispatch(new WebSocketConnected())
    }
  };

  private typeKey = this.options.typeKey!;

  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(NGXS_WEBSOCKET_OPTIONS) private options: NgxsWebsocketPluginOptions
  ) {
    this.setupActionsListeners();
  }

  private setupActionsListeners(): void {
    this.actions$.pipe(ofActionDispatched(ConnectWebSocket)).subscribe(({ payload }) => {
      this.connect(payload);
    });

    this.actions$.pipe(ofActionDispatched(DisconnectWebSocket)).subscribe(() => {
      this.disconnect();
    });

    this.actions$.pipe(ofActionDispatched(SendWebSocketMessage)).subscribe(({ payload }) => {
      this.send(payload);
    });
  }

  private connect(options?: NgxsWebsocketPluginOptions): void {
    this.updateConnection();

    // Users can pass the options in the connect method so
    // if options aren't available at DI bootstrap they have access
    // to pass them here
    if (options) {
      this.mergeConfigWithOptions(options);
    }

    this.socket = new WebSocketSubject(this.config);

    this.socket.subscribe({
      next: (message: any) => {
        const type = getValue(message, this.typeKey);
        if (!type) {
          throw new TypeKeyPropertyMissingError(this.typeKey);
        }
        this.store.dispatch({ ...message, type });
      },
      error: (error: any) => {
        if (error instanceof CloseEvent) {
          this.dispatchWebSocketDisconnected();
        } else {
          this.store.dispatch(new WebsocketMessageError(error));
        }
      }
    });
  }

  private disconnect(): void {
    if (this.socket) {
      // `socket.complete()` closes the connection
      // also it doesn't invoke the `onComplete` callback that we passed
      // into `socket.subscribe(...)`
      this.socket.complete();
      this.socket = null;
      this.dispatchWebSocketDisconnected();
    }
  }

  private send(data: any): void {
    if (!this.socket) {
      throw new Error('You must connect to the socket before sending any data');
    }

    this.socket.next(data);
  }

  /**
   * Don't enlarge the `connect` method
   */
  private mergeConfigWithOptions(options: NgxsWebsocketPluginOptions): void {
    if (options.url) {
      this.config.url = options.url;
    }

    if (options.serializer) {
      this.config.serializer = options.serializer;
    }

    if (options.deserializer) {
      this.config.deserializer = options.deserializer;
    }
  }

  /**
   * To ensure we don't have any memory leaks
   * e.g. if the user occasionally dispatched `ConnectWebSocket` twice
   * then the previous subscription will still live in the memory
   * to prevent such behavior - we close the previous connection if it exists
   */
  private updateConnection(): void {
    if (this.socket) {
      this.socket.complete();
      this.socket = null;
      this.store.dispatch(new WebSocketConnectionUpdated());
    }
  }

  /**
   * Used in many places so it's better to move the code into function
   */
  private dispatchWebSocketDisconnected(): void {
    this.store.dispatch(new WebSocketDisconnected());
  }
}
