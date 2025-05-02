import { Injectable, NgZone, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { getValue } from '@ngxs/store/plugins';
import { Subject, fromEvent, takeUntil } from 'rxjs';

import {
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage,
  NGXS_WEBSOCKET_OPTIONS,
  NgxsWebSocketPluginOptions,
  WebSocketMessageError,
  WebSocketDisconnected,
  TypeKeyPropertyMissingError,
  WebSocketConnectionUpdated,
  WebSocketConnected
} from './symbols';

@Injectable({ providedIn: 'root' })
export class WebSocketHandler {
  private _store = inject(Store);
  private _ngZone = inject(NgZone);
  private _actions$ = inject(Actions);
  private _options = inject(NGXS_WEBSOCKET_OPTIONS);

  private _socket: WebSocket | null = null;

  private readonly _socketClosed$ = new Subject<void>();

  private readonly _typeKey = this._options.typeKey!;

  private readonly _destroyRef = inject(DestroyRef);

  constructor() {
    this._setupActionsListeners();

    this._destroyRef.onDestroy(() => this._closeConnection(/* forcelyCloseSocket */ true));
  }

  private _setupActionsListeners(): void {
    this._actions$
      .pipe(ofActionDispatched(ConnectWebSocket), takeUntilDestroyed(this._destroyRef))
      .subscribe(({ payload }) => {
        this.connect(payload);
      });

    this._actions$
      .pipe(ofActionDispatched(DisconnectWebSocket), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._disconnect(/* forcelyCloseSocket */ true);
      });

    this._actions$
      .pipe(ofActionDispatched(SendWebSocketMessage), takeUntilDestroyed(this._destroyRef))
      .subscribe(({ payload }) => {
        this.send(payload);
      });
  }

  private connect(options?: NgxsWebSocketPluginOptions): void {
    if (this._socket) {
      this._closeConnection(/* forcelyCloseSocket */ true);
      this._store.dispatch(new WebSocketConnectionUpdated());
    }

    // TODO(arturovt): we should not override default config values because this breaks support for having multiple socket connections.
    if (options) {
      if (options.serializer) {
        this._options.serializer = options.serializer;
      }

      if (options.deserializer) {
        this._options.deserializer = options.deserializer;
      }
    }

    this._ngZone.runOutsideAngular(() => {
      // We either use options provided in the `ConnectWebSocket` action
      // or fallback to default config values.
      const url = options?.url || this._options.url!;
      const protocol = options?.protocol || this._options.protocol;
      const binaryType = options?.binaryType || this._options.binaryType;

      const socket = (this._socket = protocol
        ? new WebSocket(url, protocol)
        : new WebSocket(url));

      if (binaryType) {
        socket.binaryType = binaryType;
      }

      fromEvent(socket, 'open')
        .pipe(takeUntil(this._socketClosed$))
        .subscribe(() => this._store.dispatch(new WebSocketConnected()));

      fromEvent<MessageEvent>(socket, 'message')
        .pipe(takeUntil(this._socketClosed$))
        .subscribe(event => {
          const message = this._options.deserializer!(event);
          const type = getValue(message, this._typeKey);
          if (!type) {
            throw new TypeKeyPropertyMissingError(this._typeKey);
          }
          this._store.dispatch({ ...message, type });
        });

      fromEvent(socket, 'error')
        .pipe(takeUntil(this._socketClosed$))
        .subscribe(error => {
          // The error event indicates that an error has occurred during the
          // WebSocket communication, and it is often appropriate to close the
          // WebSocket connection when such an error occurs.
          // We need to call `_disconnect()` after the error event has been fired.
          // This ensures that the WebSocket connection is properly closed to prevent
          // potential resource leaks.
          this._disconnect(/* forcelyCloseSocket */ true);
          this._store.dispatch(new WebSocketMessageError(error));
        });

      fromEvent<CloseEvent>(socket, 'close')
        .pipe(takeUntil(this._socketClosed$))
        .subscribe(event => {
          if (event.wasClean) {
            // It is not necessary to call `socket.close()` after the `close` event
            // has been fired. In fact, calling `socket.close()` within the `close`
            // event handler or immediately after the event has been fired can lead
            // to unexpected behavior.
            this._disconnect(/* forcelyCloseSocket */ false);
          } else {
            // If the WebSocket `close` event has been fired and its `wasClean`
            // property is falsy, it indicates that the WebSocket connection was
            // closed in an unexpected or abnormal manner.
            // We should call `socket.close()` in this scenario, we can ensure that
            // the WebSocket connection is properly closed.
            this._disconnect(/* forcelyCloseSocket */ true);
            this._store.dispatch(new WebSocketMessageError(event));
          }
        });
    });
  }

  private _disconnect(forcelyCloseSocket: boolean): void {
    if (this._socket) {
      this._closeConnection(forcelyCloseSocket);
      this._store.dispatch(new WebSocketDisconnected());
    }
  }

  private send(data: any): void {
    if (!this._socket) {
      throw new Error('You must connect to the socket before sending any data');
    }

    try {
      this._socket.send(this._options.serializer!(data));
    } catch (error) {
      this._store.dispatch(new WebSocketMessageError(error));
    }
  }

  private _closeConnection(forcelyCloseSocket: boolean): void {
    if (forcelyCloseSocket) {
      this._socket?.close();
    }
    this._socket = null;
    this._socketClosed$.next();
  }
}
