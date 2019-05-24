import { Injectable, Inject } from '@angular/core';
import { WebSocketSubject } from './websocket-subject';
import { Actions, Store, getValue, ofActionDispatched } from '@ngxs/store';
import {
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage,
  NGXS_WEBSOCKET_OPTIONS,
  NgxsWebsocketPluginOptions,
  WebsocketMessageError,
  WebSocketDisconnected
} from './symbols';

class TypeKeyPropertyMissing extends Error {
  constructor(typeKey: string) {
    super(`Property ${typeKey} is missing on the socket message`);
  }
}

@Injectable()
export class WebSocketHandler {
  constructor(
    store: Store,
    actions$: Actions,
    socket: WebSocketSubject,
    @Inject(NGXS_WEBSOCKET_OPTIONS) config: NgxsWebsocketPluginOptions
  ) {
    const typeKey = config.typeKey!;

    actions$.pipe(ofActionDispatched(ConnectWebSocket)).subscribe(event => {
      socket.connect(event.payload);
    });

    actions$.pipe(ofActionDispatched(DisconnectWebSocket)).subscribe(() => {
      socket.disconnect();
    });

    actions$.pipe(ofActionDispatched(SendWebSocketMessage)).subscribe(({ payload }) => {
      socket.send(payload);
    });

    socket.subscribe(
      message => {
        const type = getValue(message, typeKey);
        if (!type) {
          throw new TypeKeyPropertyMissing(typeKey);
        }
        store.dispatch({ ...message, type });
      },
      error => {
        if (error instanceof CloseEvent) {
          store.dispatch(new WebSocketDisconnected());
        } else {
          store.dispatch(new WebsocketMessageError(error));
        }
      }
    );

    socket.rxWebSocketComplete$.subscribe(() => {
      store.dispatch(new WebSocketDisconnected());
    });
  }
}
