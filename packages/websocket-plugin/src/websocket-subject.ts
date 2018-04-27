import { Injectable, Inject } from '@angular/core';
import { Subject, Observer, Observable, interval } from 'rxjs';
import { WebSocketSubject as RxWebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { NGXS_WEBSOCKET_OPTIONS, NgxsWebsocketPluginOptions } from './symbols';
import { share, distinctUntilChanged, filter, takeWhile } from 'rxjs/operators';

/**
 * Websocket Subject
 * Heavily Inspired by: https://gearheart.io/blog/auto-websocket-reconnection-with-rxjs/
 */
@Injectable()
export class WebSocketSubject extends Subject<any> {
  /**
   * The connection status of the websocket.
   */
  connectionStatus: Observable<any>;

  private _socket: RxWebSocketSubject<any>;
  private _reconnectionObservable: Observable<number>;
  private _reconnectAttempts: number;
  private _connectionObserver: Observer<boolean>;
  private _internalConfig: WebSocketSubjectConfig<any>;

  constructor(@Inject(NGXS_WEBSOCKET_OPTIONS) private _config: NgxsWebsocketPluginOptions) {
    super();

    this.connectionStatus = new Observable(observer => (this._connectionObserver = observer)).pipe(
      share(),
      distinctUntilChanged()
    );

    this._internalConfig = {
      url: this._config.url,
      serializer: this._config.serializer,
      deserializer: this._config.deserializer,
      closeObserver: {
        next: (e: CloseEvent) => {
          this._socket = null;
          this._connectionObserver.next(false);
        }
      },
      openObserver: {
        next: (e: Event) => this._connectionObserver.next(true)
      }
    };

    this.connectionStatus
      .pipe(filter(isConnected => !this._reconnectionObservable && isConnected === false))
      .subscribe(isConnected => this.reconnect());
  }

  /**
   * Kickoff the connection to the websocket.
   */
  connect(url?: string) {
    // Users can pass the URL via the setup or via
    // the config. This is needed when the URL is totally dynamic.
    if (url) {
      this._internalConfig.url = url;
    }

    this._socket = new RxWebSocketSubject(this._internalConfig);
    this._socket.subscribe(
      message => this.next(message),
      (error: Event) => {
        if (!this._socket) {
          this.reconnect();
        }
      }
    );
  }

  /**
   * Disconnected the websocket.
   */
  disconnect() {
    if (this._socket) {
      this._socket.complete();
      this._socket = undefined;
    }
  }

  /**
   * Try to reconnect on a interval.
   */
  reconnect() {
    this._reconnectionObservable = interval(this._config.reconnectInterval).pipe(
      takeWhile((v, index) => index < this._reconnectAttempts && !this._socket)
    );

    this._reconnectionObservable.subscribe(() => this.connect(), null, () => {
      this._reconnectionObservable = null;
      if (!this._socket) {
        this.complete();
        this._connectionObserver.complete();
      }
    });
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
