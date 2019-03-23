import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgxsModule, Actions, ofAction, Store } from '@ngxs/store';
import {
  NgxsWebsocketPluginModule,
  ConnectWebSocket,
  SendWebSocketMessage,
  DisconnectWebSocket,
  WebSocketDisconnected,
  WebsocketMessageError
} from '../';
import { Server, WebSocket } from 'mock-socket';
import { take } from 'rxjs/operators';

describe('NgxsWebsocketPlugin', () => {
  class SetMessage {
    static readonly type = 'SET_MESSAGE';
    constructor(public payload: string) {}
  }

  const createMessage = () => {
    return new SendWebSocketMessage({ type: 'SET_MESSAGE', payload: 'from websocket' });
  };

  const SOCKET_URL = 'ws://localhost:8400/websock';
  let store: Store;
  let actions$: Actions;

  beforeEach(() => {
    (<any>window).WebSocket = WebSocket;

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([]),
        NgxsWebsocketPluginModule.forRoot({
          url: SOCKET_URL
        })
      ]
    });

    store = TestBed.get(Store);
    actions$ = TestBed.get(Actions);
  });

  const mockServer = new Server(SOCKET_URL);

  it('should forward socket message to store', fakeAsync((done: DoneFn) => {
    mockServer.on('connection', (socket: any) => {
      mockServer.on('message', (data: any) => socket.send(data));
      tick(1000);

      store.dispatch(new ConnectWebSocket());
      store.dispatch(createMessage());

      actions$
        .pipe(
          ofAction(SetMessage),
          take(1)
        )
        .subscribe(({ payload }: any) => {
          expect(payload).toBe('from websocket');
          done();
        });
    });
  }));

  it('should dispatch WebsocketMessageError on error', fakeAsync((done: DoneFn) => {
    tick();
    actions$
      .pipe(
        ofAction(WebsocketMessageError),
        take(1)
      )
      .subscribe(err => {
        expect(err instanceof CloseEvent).toBe(true);
        mockServer.stop(done);
        done();
      });
  }));

  it('should dispatch WebSocketDisconnected on client initialted disconnect', fakeAsync((
    done: DoneFn
  ) => {
    tick();
    actions$
      .pipe(
        ofAction(WebSocketDisconnected),
        take(1)
      )
      .subscribe(() => {
        expect('called').toBe('called');
        done();
      });

    store.dispatch(new DisconnectWebSocket());
  }));

  it('should dispatch WebSocketDisconnected on server initiated disconnect', fakeAsync((
    done: DoneFn
  ) => {
    mockServer.on('connection', (socket: any) => {
      mockServer.on('message', (data: any) => socket.send(data));
      tick(1000);

      store.dispatch(new ConnectWebSocket());

      actions$
        .pipe(
          ofAction(WebSocketDisconnected),
          take(1)
        )
        .subscribe(() => {
          expect('called').toBe('called');

          done();
        });

      mockServer.stop(done);
    });
  }));
});
