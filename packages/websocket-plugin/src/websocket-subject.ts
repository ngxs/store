import { Injectable, Inject } from '@angular/core';

import { Subject, BehaviorSubject } from 'rxjs';
import {
  WebSocketSubject as RxWebSocketSubject,
  WebSocketSubjectConfig
} from 'rxjs/webSocket';

import { NGXS_WEBSOCKET_OPTIONS, NgxsWebsocketPluginOptions } from './symbols';

/**
 * Websocket Subject
 * Heavily Inspired by: https://gearheart.io/blog/auto-websocket-reconnection-with-rxjs/
 */
@Injectable()
export class WebSocketSubject extends Subject<any> {
  /**
   * The connection status of the web socket.
   * `BehaviorSubject` is used here except of `Subject` becase it's possible
   * to retrieve the connection status without subscribing, `getValue()` is quite enough
   */
  connectionStatus = new BehaviorSubject<boolean>(false);

  /**
   * This is a helper event emitter for the `WebSocketHandler` class, as we wanna
   * avoid completing this subject
   */
  completeWebSocket$ = new Subject<void>();

  private _socket: RxWebSocketSubject<any> | null;
  private _internalConfig: WebSocketSubjectConfig<any>;

  constructor(@Inject(NGXS_WEBSOCKET_OPTIONS) private _config: NgxsWebsocketPluginOptions) {
    super();

    this._internalConfig = {
      url: this._config.url!,
      serializer: this._config.serializer,
      deserializer: this._config.deserializer,
      closeObserver: {
        next: () => {
          this._socket = null;
          this.connectionStatus.next(false);
        }
      },
      openObserver: {
        next: () => this.connectionStatus.next(true)
      }
    };
  }

  /**
   * Kickoff the connection to the websocket.
   */
  connect(options?: NgxsWebsocketPluginOptions) {
    // Users can pass the options in the connect method so
    // if options aren't available at DI bootstrap they have access
    // to pass them here
    if (options) {
      if (options.url) {
        this._internalConfig.url = options.url;
      }

      if (options.serializer) {
        this._internalConfig.serializer = options.serializer;
      }

      if (options.deserializer) {
        this._internalConfig.deserializer = options.deserializer;
      }
    }

    this._socket = new RxWebSocketSubject(this._internalConfig);
    this._socket.subscribe(
      (message: any) => this.next(message),
      (error: any) => this.error(error),
      // ATTENTION: don't call `this.complete()` here, as the subject will become `isStopped`
      // and will never emit any message!
      () => {
        // Notice this callback is invoked only when the server side socket closes connection!
        this.completeWebSocket$.next();
      }
    );
  }

  /**
   * Disconnected the websocket.
   */
  disconnect() {
    if (this._socket) {
      this._socket.complete();
      // `this._socket.complete()` doesn't invoke the callback that we passed in `subscribe`
      this.completeWebSocket$.next();
      this._socket = null;
    }
  }

  /**
   * Send data to the websocket.
   */
  send(data: any): void {
    if (!this._socket) {
      throw new Error('You must connect before sending data');
    }

    this._socket.next(data);
  }
}
