import { Injectable, Inject } from '@angular/core';
import { WebSocketSubject } from './websocket-subject';
import { Actions, Store } from '@ngxs/store';
import {
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage,
  NGXS_WEBSOCKET_OPTIONS,
  NgxsWebsocketPluginOptions,
  WebsocketMessageError
} from './symbols';
import { filter } from 'rxjs/operators';
import { getValue } from '@ngxs/store';

@Injectable()
export class WebSocketHandler {
  constructor(
    store: Store,
    actions: Actions,
    socket: WebSocketSubject,
    @Inject(NGXS_WEBSOCKET_OPTIONS) config: NgxsWebsocketPluginOptions
  ) {
    actions.pipe(filter(t => t instanceof ConnectWebSocket)).subscribe(event => socket.connect(event.payload));
    actions.pipe(filter(t => t instanceof DisconnectWebSocket)).subscribe(event => socket.disconnect());
    actions.pipe(filter(t => t instanceof SendWebSocketMessage)).subscribe(({ payload }) => socket.send(payload));
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
