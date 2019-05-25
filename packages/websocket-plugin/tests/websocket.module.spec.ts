import { TestBed } from '@angular/core/testing';
import {
  NgxsModule,
  Actions,
  ofAction,
  Store,
  State,
  Action,
  StateContext,
  ofActionSuccessful
} from '@ngxs/store';

import { take, finalize, tap, first } from 'rxjs/operators';

import { Server, WebSocket } from 'mock-socket';

import {
  NgxsWebsocketPluginModule,
  ConnectWebSocket,
  SendWebSocketMessage,
  DisconnectWebSocket,
  WebSocketDisconnected,
  WebsocketMessageError
} from '../';

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

    mockServer.on('connection', (socket: any) => {
      socket.on('message', (data: any) => socket.send(data));

      actions$
        .pipe(
          ofAction(SetMessage),
          take(1),
          finalize(() => mockServer.stop(done))
        )
        .subscribe(action => {
          // Assert
          expect(action).toEqual({ type: 'SET_MESSAGE', payload: 'from websocket' });
        });
    });

    store.dispatch(createMessage());
  });

  it('should dispatch WebSocketDisconnected on client initialed disconnect', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    actions$
      .pipe(
        ofAction(WebSocketDisconnected),
        take(1),
        finalize(() => mockServer.stop(done))
      )
      .subscribe(action => {
        // Assert
        expect(action instanceof WebSocketDisconnected).toBeTruthy();
      });

    store.dispatch(new DisconnectWebSocket());
  });

  it('should dispatch WebSocketDisconnected if server closed connection', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    mockServer.on('connection', socket => socket.close());

    actions$
      .pipe(
        ofAction(WebSocketDisconnected),
        take(1),
        finalize(() => mockServer.stop(done))
      )
      .subscribe(action => {
        // Assert
        expect(action instanceof WebSocketDisconnected).toBeTruthy();
      });
  });

  it('should dispatch WebSocketMessageError if socker errors', done => {
    // Arrange
    const mockServer = createModuleAndServer();
    const store = getStore();
    const actions$ = getActions$();

    // Act
    store.dispatch(new ConnectWebSocket());

    mockServer.on('connection', () => {
      mockServer.emit('error', new Error('just an error'));
    });

    actions$
      .pipe(
        ofAction(WebsocketMessageError),
        take(1),
        finalize(() => mockServer.stop(done))
      )
      .subscribe(action => {
        // Assert
        expect(action instanceof WebsocketMessageError).toBeTruthy();
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
    mockServer.on('connection', (socket: any) => {
      socket.on('message', (data: any) => {
        // Assert
        expect(data).toBe('');
        mockServer.stop(done);
      });
    });

    store.dispatch(new SendWebSocketMessage({ foo: true }));
  });

  describe('WebSocketSubject', () => {
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

    it('should reconnect after disconnect and WebSocketSubject should continue emitting events', done => {
      // Arrange
      const mockServer = createModuleAndServer([MessagesState]);
      const store = getStore();
      const actions$ = getActions$();

      // Act
      mockServer.on('connection', (socket: any) => {
        socket.on('message', (data: any) => {
          // That's the object that we passed into `SendWebSocketMessage` constructor
          const { type, from, message } = JSON.parse(data);

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
        });
      });

      const connect = () => {
        store.dispatch(new ConnectWebSocket());

        const event = new SendWebSocketMessage({
          type: 'message',
          from: 'Artur',
          message: 'Hello bro'
        });

        store.dispatch(event);
      };

      let i = 0;

      actions$
        .pipe(
          ofActionSuccessful(AddMessage),
          // `take(2)` doesn't seem to work here
          tap(() => i++),
          first(() => i === 2)
        )
        .subscribe(() => {
          const messages = store.selectSnapshot<Message[]>(MessagesState);

          // Assert
          expect(messages.length).toBe(2);
          expect(messages).toEqual([
            { from: 'Artur', message: 'Hello bro' },
            { from: 'Artur', message: 'Hello bro' }
          ]);

          mockServer.stop(done);
        });

      actions$
        .pipe(
          ofActionSuccessful(WebSocketDisconnected),
          take(1)
        )
        .subscribe(action => {
          expect(action instanceof WebSocketDisconnected).toBeTruthy();
          // Reconnect after disconnect
          connect();
        });

      connect();
    });
  });
});
