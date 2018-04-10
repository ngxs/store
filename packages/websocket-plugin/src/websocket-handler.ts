import { Injectable, Inject } from '@angular/core';
import { WebSocketSubject } from './websocket-subject';
import { Actions, Store, getValue, ofActionDispatched } from '@ngxs/store';
import {
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage,
  NGXS_WEBSOCKET_OPTIONS,
  NgxsWebsocketPluginOptions,
  WebsocketMessageError
} from './symbols';

@Injectable()
export class WebSocketHandler {
  constructor(
    store: Store,
    actions: Actions,
    socket: WebSocketSubject,
    @Inject(NGXS_WEBSOCKET_OPTIONS) config: NgxsWebsocketPluginOptions
  ) {
    actions.pipe(ofActionDispatched(ConnectWebSocket)).subscribe(event => socket.connect(event.payload));
    actions.pipe(ofActionDispatched(DisconnectWebSocket)).subscribe(event => socket.disconnect());
    actions.pipe(ofActionDispatched(SendWebSocketMessage)).subscribe(({ payload }) => socket.send(payload));
    socket.subscribe(
      msg => {
        const type = getValue(msg, config.typeKey);
        if (!type) {
          throw new Error(`Type ${type} not found on message`);
        }
        store.dispatch({ ...msg, type });
      },
      err => store.dispatch(new WebsocketMessageError(err))
    );
  }
}
