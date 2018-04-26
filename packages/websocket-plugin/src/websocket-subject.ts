import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Observer, Observable, interval } from 'rxjs';
import { webSocket } from 'rxjs/websocket';
import { NGXS_WEBSOCKET_OPTIONS, NgxsWebsocketPluginOptions } from './symbols';
import { share, distinctUntilChanged, filter, takeWhile } from 'rxjs/operators';

/**
 * Websocket Subject
 * Heavily Inspired by: https://gearheart.io/blog/auto-websocket-reconnection-with-rxjs/
 */
@Injectable()
export class WebSocketSubject extends Subject<any> {
  connectionStatus: Observable<any>;
  private _socket: any;
  private _reconnectionObservable: Observable<number>;
  private _reconnectAttempts: number;
  private _connectionObserver: Observer<boolean>;
  private _internalConfig: any;

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
      .pipe(filter(isConnected => !this._reconnectionObservable && typeof isConnected === 'boolean' && !isConnected))
      .subscribe(isConnected => {
        // fix(amcdnl): temp remove reconnect since
        // its not working correctly with latest rx
        // this.reconnect();
      });
  }

  connect(url?: string) {
    if (url) {
      // sometimes you need the ability to override the URL passed
      this._internalConfig.url = url;
    }

    this._socket = webSocket(this._internalConfig);
    this._socket.subscribe(
      message => this.next(message),
      (error: Event) => {
        if (!this._socket) {
          this.reconnect();
        }
      }
    );
  }

  disconnect() {
    if (this._socket) {
      this._socket.complete();

      // set to undefined so send() can throw error.
      this._socket = undefined;
    }
  }

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

  send(data: any): void {
    if (!this._socket) {
      throw new Error('You must connect before sending data');
    }

    this._socket.next(data);
  }
}
