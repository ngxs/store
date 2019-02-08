import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgxsModule, Actions, ofAction, Store } from '@ngxs/store';
import {
  NgxsWebsocketPluginModule,
  ConnectWebSocket,
  SendWebSocketMessage,
  DisconnectWebSocket,
  WebSocketDisconnected,
  WebSocketMessageError
} from '../';
import { Server, WebSocket } from 'mock-socket';
import { take } from 'rxjs/operators';

fdescribe('NgxsWebsocketPlugin', () => {
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

  it('should forward socket message to store', fakeAsync((done: () => void) => {
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

  it('should dispatch WebSocketMessageError on error', fakeAsync((done: () => void) => {
    tick();
    actions$
      .pipe(
        ofAction(WebSocketMessageError),
        take(1)
      )
      .subscribe(err => {
        expect(err instanceof CloseEvent).toBe(true);
        mockServer.stop(done);
        done();
      });
  }));

  it('should dispatch WebSocketDisconnected on disconnect', fakeAsync((done: () => void) => {
    tick();
    actions$
      .pipe(
        ofAction(WebSocketDisconnected),
        take(1)
      )
      .subscribe(() => {
        expect('called').toBe('called');
        mockServer.stop(done);
        done();
      });

    store.dispatch(new DisconnectWebSocket());
  }));
});

//import { fakeAsync, TestBed, tick } from '@angular/core/testing';
//import { NgxsModule, Actions, ofAction, Store } from '@ngxs/store';
//import {
//  NgxsWebsocketPluginModule,
//  ConnectWebSocket,
//  SendWebSocketMessage,
//  DisconnectWebSocket,
//  WebSocketDisconnected
//} from '../';
//import { Server, WebSocket } from 'mock-socket';
//import { take } from 'rxjs/operators';
//
//describe('NgxsWebsocketPlugin', () => {
//  class SetMessage {
//    static readonly type = 'SET_MESSAGE';
//    constructor(public payload: string) {}
//  }
//
//  const createMessage = () => {
//    return new SendWebSocketMessage({ type: 'SET_MESSAGE', payload: 'from websocket' });
//  };
//
//  const SOCKET_URL = 'ws://localhost:8400/websock';
//  let store: Store;
//  let actions$: Actions;
//
//  beforeEach(() => {
//    (<any>window).WebSocket = WebSocket;
//
//    TestBed.configureTestingModule({
//      imports: [
//        NgxsModule.forRoot([]),
//        NgxsWebsocketPluginModule.forRoot({
//          url: SOCKET_URL
//        })
//      ]
//    });
//
//    store = TestBed.get(Store);
//    actions$ = TestBed.get(Actions);
//  });
//
//  // const mockServer = new Server(SOCKET_URL);
//
//  it('should forward socket message to store', fakeAsync((done: () => void) => {
//    mockServer.on('connection', (socket: any) => {
//      mockServer.on('message', (data: any) => socket.send(data));
//      tick(1000);
//
//      store.dispatch(new ConnectWebSocket());
//      store.dispatch(createMessage());
//
//      actions$
//        .pipe(
//          ofAction(SetMessage),
//          take(1)
//        )
//        .subscribe(({ payload }: any) => {
//          expect(payload).toBe('from websocket');
//          done();
//        });
//    });
//  }));
//  //
//  //  it('should dispatch WebSocketMessageError on error', fakeAsync((done: () => void) => {
//  //    fakeSocket = new Subject<any>();
//  //    spyOn(Observable,'websocket').and.returnValue(fakeSocket);
//  //
//  //    actions$
//  //      .pipe(
//  //        ofAction(WebSocketMessageError),
//  //        take(1)
//  //      )
//  //      .subscribe((payload) => {
//  //        expect(payload).toBe('AN_ERROR');
//  //        // mockServer.stop(done);
//  //        done();
//  //      });
//  //    fakeSocket.error('AN_ERROR')
//  //  }));
//
//  it('should dispatch WebSocketDisconnected on disconnect', fakeAsync((done: () => void) => {
//    actions$
//      .pipe(
//        ofAction(WebSocketDisconnected),
//        take(1)
//      )
//      .subscribe(() => {
//        expect('called').toBe('called');
//        mockServer.stop(done);
//        done();
//      });
//    store.dispatch(new DisconnectWebSocket());
//  }));
//});

//disconnect is also an error test
//      actions$
//      .pipe(
//        ofAction(WebSocketMessageError),
//        take(1)
//      )
//      .subscribe((err) => {
//        expect(err instanceof CloseEvent).toBe(true);
//          mockServer.stop(done);
//        done();
//      });
