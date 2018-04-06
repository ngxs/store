# Websocket Plugin - Experimental Status
Bind server websocket events to Ngxs store actions.

## Install
Websocket plugin is a separate install from NPM, run the following to install it:

```bash
npm i @ngxs/websocket-plugin --S
```

## Configuration
Add the `NgxsWebsocketPluginModule` plugin to your root app module:

```javascript
import { NgxsModule } from '@ngxs/store';
import { NgxsWebsocketPluginModule } from '@ngxs/websocket-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsWebsocketPluginModule.forRoot({
      url: 'ws://localhost:4200/websock'
    })
  ]
})
export class AppModule {}
```

The plugin has a variety of options that can be passed:

- `url`: Url of the websocket connection. Can be passed here or by the `ConnectWebsocket` action.
- `typeKey`: Object property that maps the websocket message to a action type. Default: `type`
- `reconnectInterval`: Interval of which to reconnect if the client is disconnected. Default: `5000`
- `reconnectAttempts`: Number of times before giving up on connection retries. Default: `10`
- `serializer`: Serializer before sending objects to the websocket. Default: `JSON.stringify`

## Usage
Once connected any message that comes across the websocket will be bound to the state event stream.

Let's say you have a websocket message that comes in like:

```json
{
  "type": "ADD_ANIMALS",
  "animals": []
}
```

We will want to make a action that corresponds to this websocket message, that will
look like:

```TS
export class AddAnimals {
  static readonly type = 'ADD_ANIMALS';
  constructor(public animals: any[]) {}
}
```

Now in our state, we just bind to the `AddAnimals` action like any other 
action:

```TS
@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
export class ZooState {
  @Action(AddAnimals)
  addAnimals({ setState }: StateContext<ZooStateModel>, { animals }: AddAnimals) {
    setState({ animals: [...animals] });
  }
}
```

to send messages to the server, we can dispatch the `SendWebSocketMessage` with
the payload being what you want to send.

```TS
@Component({ ... })
export class AppComponent {

  constructor(private store: Store) {}

  onClick() {
    this.store.dispatch(new SendWebSocketMessage({ foo: true }));
  }

}
```

When sending the message, remember the send is accepting a JSON-able object.

In order to kick off our websockets we have to dispatch the `ConnectWebSocket`
action. This will typically happen at startup or if you need to authenticate
before, after authentication is done. You can optionally pass the URL here.

```TS
@Component({ ... })
export class AppComponent {

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(new ConnectWebSocket());
  }

}
```

Here is a list of all the available actions you have:

- `ConnectWebSocket`: Action dispatched when you want to init the websocket. Optionally pass URL here.
- `DisconnectWebSocket`: Action dispatched when the websockets disconnect
- `SendWebSocketMessage`: Send a message to the server
- `WebsocketMessageError`: Error ocurred when receiving a message.

