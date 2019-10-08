import { TestBed } from '@angular/core/testing';
import {
  NgxsModule,
  Actions,
  Store,
  State,
  Action,
  StateContext,
  ofActionSuccessful,
  ofActionDispatched
} from '@ngxs/store';

import { tap, first } from 'rxjs/operators';

import { Server, WebSocket } from 'mock-socket';

import {
  NgxsWebsocketPluginModule,
  ConnectWebSocket,
  SendWebSocketMessage,
  DisconnectWebSocket,
  WebSocketDisconnected,
  WebsocketMessageError,
  WebSocketConnectionUpdated,
  WebSocketConnected
} from '../';

type WebSocketMessage = string | Blob | ArrayBuffer | ArrayBufferView;

declare module 'mock-socket' {
  interface WebSocketCallbackMap {
    close: () => void;
    error: (err: Error) => void;
    message: (message: WebSocketMessage) => void;
    open: () => void;
  }

  interface WebSocket {
    // the `WebSocket` from the `mock-socket` package actually has this method!
    // but they didn't add this method to the interface!
    // that's why we do "module augmentation"
    // so we don't have to use `any` type like `(socket: any)`
    on<K extends keyof WebSocketCallbackMap>(type: K, callback: WebSocketCallbackMap[K]): void;
  }
}

describe('NgxsWebsocketPlugin', () => {
  beforeEach(() => {
    (<any>window).WebSocket = WebSocket;
  });

  const url = 'ws://localhost:8080';

  const getStore = (): Store => TestBed.get(Store);
  const getActions$ = (): Actions => TestBed.get(Actions);

  const createModuleAndServer = (states: any[] = []) => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states), NgxsWebsocketPluginModule.forRoot({ url })]
    });

    return new Server(url);
  };

  it('should forward socket message to store', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    class SetMessage {
      static readonly type = 'SET_MESSAGE';
      constructor(public payload: string) {}
    }

    const createMessage = () => {
      return new SendWebSocketMessage({ type: 'SET_MESSAGE', payload: 'from websocket' });
    };

    // Act
    store.dispatch(new ConnectWebSocket());

    mockServer.on('connection', (socket: WebSocket) => {
      socket.on('message', (data: WebSocketMessage) => socket.send(data));

      actions$.pipe(ofActionDispatched(SetMessage)).subscribe(action => {
        // Assert
        expect(action).toEqual({ type: 'SET_MESSAGE', payload: 'from websocket' });
        mockServer.stop(done);
      });
    });

    store.dispatch(createMessage());
  });

  it('should dispatch WebSocketDisconnected if client dispatched disconnect action', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    actions$.pipe(ofActionDispatched(WebSocketDisconnected)).subscribe(action => {
      // Assert
      expect(action).toBeInstanceOf(WebSocketDisconnected);
      mockServer.stop(done);
    });

    store.dispatch(new DisconnectWebSocket());
  });

  it('should dispatch WebSocketConnected if connection is opened successfully', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    actions$.pipe(ofActionDispatched(WebSocketConnected)).subscribe(action => {
      // Assert
      expect(action).toBeInstanceOf(WebSocketConnected);
      mockServer.stop(done);
    });
  });

  it('should dispatch WebSocketDisconnected if server closed connection', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    mockServer.on('connection', socket => socket.close());

    actions$.pipe(ofActionDispatched(WebSocketDisconnected)).subscribe(action => {
      // Assert
      expect(action).toBeInstanceOf(WebSocketDisconnected);
      mockServer.stop(done);
    });
  });

  it('should dispatch WebSocketMessageError if socket errors', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    mockServer.on('connection', () => {
      mockServer.emit('error', new Error('just an error'));
    });

    actions$.pipe(ofActionDispatched(WebsocketMessageError)).subscribe(action => {
      // Assert
      expect(action).toBeInstanceOf(WebsocketMessageError);
      mockServer.stop(done);
    });
  });

  it('should be possible to provide custom options', done => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        NgxsWebsocketPluginModule.forRoot({
          url,
          deserializer: () => null,
          serializer: () => ''
        })
      ]
    });

    const mockServer = new Server(url);
    const store = getStore();

    store.dispatch(new ConnectWebSocket());

    // Act
    mockServer.on('connection', (socket: WebSocket) => {
      socket.on('message', (data: WebSocketMessage) => {
        // Assert
        expect(data).toBe('');
        mockServer.stop(done);
      });
    });

    store.dispatch(new SendWebSocketMessage({ foo: true }));
  });

  it('should dispatch WebSocketConnectionUpdated if `connect` is invoked with already existing connection', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    // We can't dispatch an array of actions here
    setTimeout(() => {
      store.dispatch(new ConnectWebSocket());
    });

    actions$.pipe(ofActionDispatched(WebSocketConnectionUpdated)).subscribe(action => {
      // Assert
      expect(action).toBeInstanceOf(WebSocketConnectionUpdated);
      mockServer.stop(done);
    });
  });

  describe('WebSocketHandler', () => {
    class AddMessage {
      static type = '[Chat] Add message';
      constructor(public from: string, public message: string) {}
    }

    interface Message {
      from: string;
      message: string;
    }

    @State<Message[]>({
      name: 'messages',
      defaults: []
    })
    class MessagesState {
      @Action(AddMessage)
      addMessage(ctx: StateContext<Message[]>, { from, message }: AddMessage) {
        const state = ctx.getState();
        ctx.setState([...state, { from, message }]);
      }
    }

    const connect = (store: Store) => {
      store.dispatch(new ConnectWebSocket());

      const event = new SendWebSocketMessage({
        type: 'message',
        from: 'Artur',
        message: 'Hello bro'
      });

      store.dispatch(event);
    };

    const getMessages = (store: Store) => store.selectSnapshot<Message[]>(MessagesState);

    // First class function that takes socket as an argument
    // and returns `onMessage` callback
    const socketOnMessage = (socket: WebSocket) => (data: WebSocketMessage) => {
      // That's the object that we passed into `SendWebSocketMessage` constructor
      const { type, from, message } = JSON.parse(data as string);

      if (type !== 'message') {
        return;
      }

      const event = JSON.stringify({
        type: '[Chat] Add message',
        from,
        message
      });

      socket.send(event);
      // Close connection so the client is able to receive event
      // and try to reconnect
      socket.close();
    };

    it('should reconnect after disconnect and WebSocketSubject should continue emitting events', done => {
      // Arrange
      const mockServer = createModuleAndServer([MessagesState]);
      const store = getStore();
      const actions$ = getActions$();

      // Act
      mockServer.on('connection', (socket: WebSocket) => {
        socket.on('message', socketOnMessage(socket));
      });

      let addMessageSuccessfullyDispatchedTimes = 0;

      actions$
        .pipe(
          ofActionSuccessful(AddMessage),
          tap(() => addMessageSuccessfullyDispatchedTimes++),
          first(() => addMessageSuccessfullyDispatchedTimes === 2)
        )
        .subscribe(() => {
          const messages = getMessages(store);

          // Assert
          expect(messages.length).toBe(2);
          expect(messages).toEqual([
            { from: 'Artur', message: 'Hello bro' },
            { from: 'Artur', message: 'Hello bro' }
          ]);

          mockServer.stop(done);
        });

      actions$.pipe(ofActionDispatched(WebSocketDisconnected)).subscribe(action => {
        expect(action).toBeInstanceOf(WebSocketDisconnected);
        // Reconnect after disconnect
        connect(store);
      });

      connect(store);
    });

    it('should be possible to retrieve next messages if the server side socket errors', done => {
      // Arrange
      const mockServer = createModuleAndServer([MessagesState]);
      const store = getStore();
      const actions$ = getActions$();

      // Just a helper variable
      const status = {
        firstConnection: true,
        secondConnection: false
      };

      // Act
      mockServer.on('connection', (socket: WebSocket) => {
        if (status.firstConnection) {
          // On the first connection emit error
          mockServer.emit('error', new Error('just an error'));
          socket.close();
        }

        // Next time error will not be emitted
        status.firstConnection = false;

        if (status.secondConnection) {
          // On the second connection send normal message
          socket.on('message', socketOnMessage(socket));
        }

        // Next time we will listen to the `message` event
        status.secondConnection = true;
      });

      let addMessageSuccessfullyDispatchedTimes = 0;

      actions$
        .pipe(
          ofActionSuccessful(AddMessage),
          tap(() => addMessageSuccessfullyDispatchedTimes++),
          first(() => addMessageSuccessfullyDispatchedTimes === 1)
        )
        .subscribe(() => {
          const messages = getMessages(store);

          // Assert
          expect(messages.length).toBe(1);
          expect(messages).toEqual([{ from: 'Artur', message: 'Hello bro' }]);

          mockServer.stop(done);
        });

      actions$.pipe(ofActionDispatched(WebSocketDisconnected)).subscribe(action => {
        expect(action).toBeInstanceOf(WebSocketDisconnected);
        // Reconnect after disconnect
        connect(store);
      });

      connect(store);
    });
  });
});
