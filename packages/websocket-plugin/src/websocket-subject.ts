import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs';
import { WebSocketSubject as RxWebSocketSubject, WebSocketSubjectConfig } from 'rxjs/observable/dom/WebSocketSubject';
import { NGXS_WEBSOCKET_OPTIONS, NgxsWebsocketPluginOptions, configDefaults } from './symbols';
import { share, distinctUntilChanged, filter, takeWhile } from 'rxjs/operators';
import { interval } from 'rxjs/observable/interval';

/**
 * Websocket Subject
 * Heavily Inspired by: https://gearheart.io/blog/auto-websocket-reconnection-with-rxjs/
 * Backoff by: https://github.com/tjmehta/observable-backoff
 */
@Injectable()
export class WebSocketSubject extends Subject<any> {
  connectionStatus: Observable<any>;
  private _socket: RxWebSocketSubject<any>;
  private _reconnectionObservable: Observable<number>;
  private _reconnectAttempts: number;
  private _connectionObserver: Observer<boolean>;
  private _internalConfig: WebSocketSubjectConfig;

  constructor(@Inject(NGXS_WEBSOCKET_OPTIONS) private _config: NgxsWebsocketPluginOptions) {
    super();

    this._config = { ...configDefaults, ...this._config };

    this.connectionStatus = new Observable(observer => (this._connectionObserver = observer)).pipe(
      share(),
      distinctUntilChanged()
    );

    this._internalConfig = {
      url: this._config.url,
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
      .subscribe(isConnected => this.reconnect());
  }

  connect() {
    this._socket = new RxWebSocketSubject(this._internalConfig);
    this._socket.subscribe(
      message => this.next(this._config.deserializer(message)),
      (error: Event) => {
        if (!this._socket) {
          this.reconnect();
        }
      }
    );
  }

  disconnect() {
    super.complete();
    this._socket.complete();
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

  next(data: any): void {
    this._socket.next(this._config.serializer(data));
  }
}
