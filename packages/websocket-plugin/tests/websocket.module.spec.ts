import { TestBed } from '@angular/core/testing';

import { NgxsModule, State, Action, Store } from '@ngxs/store';

import {
  NgxsWebsocketPluginModule,
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage
} from '../';
import { Server } from 'mock-socket';

describe('NgxsWebsocketPlugin', () => {
  interface StateModel {
    message: string;
  }

  class SetMessage {
    static readonly type = 'SET_MESSAGE';
    constructor(public payload: string) {}
  }

  @State<StateModel>({
    name: 'actions',
    defaults: {
      message: ''
    }
  })
  class MyStore {
    @Action(SetMessage)
    setMessage({ patchState }, { payload }) {
      patchState({ message: payload });
    }
  }

  const createMessage = () => {
    return new SendWebSocketMessage(
      {'type' : 'SET_MESSAGE', 'payload' : 'from websocket'}
    );
  };

  const SOCKET_URL = 'ws://localhost:8400/websock';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsWebsocketPluginModule.forRoot({
          url: SOCKET_URL
        })
      ]
    });
  });

  it('should not send message if socket is closed', (done) => {
    const store = TestBed.get(Store);
    const mockServer = new Server(SOCKET_URL);
    mockServer.on('message', data => {
      mockServer.send(data);
    });

    try {
      store.dispatch(createMessage());
      // should not come here
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toBe('You must connect before sending data');
    }
    setTimeout(() => {
       mockServer.stop(done);
    }, 100);

  });

  it('should not send message if socket is closed after connection', (done) => {
    const store = TestBed.get(Store);
    const mockServer = new Server(SOCKET_URL);
    mockServer.on('message', data => {
      mockServer.send(data);
    });

    store.dispatch(new ConnectWebSocket());
    store.dispatch(new DisconnectWebSocket());
    try {
      store.dispatch(createMessage());
      // should not come here
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toBe('You must connect before sending data');
    }
    setTimeout(() => {
       mockServer.stop(done);
    }, 100);

  });

  it('should forward socket message to store', (done) => {
    const store = TestBed.get(Store);
    const mockServer = new Server(SOCKET_URL);
    mockServer.on('message', data => {
      mockServer.send(data);
    });

    store.dispatch(new ConnectWebSocket());
    store.dispatch(createMessage());
    setTimeout(() => {
       store.select(state => state.actions.message).subscribe((message: string) => {
         expect(message).toBe('from websocket');
       });
       mockServer.stop(done);
    }, 100);

  });
});
