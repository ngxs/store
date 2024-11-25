import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { NgxsModule, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { Server } from 'mock-socket';

import { mockWebSocket } from './utils';
import { WebSocketHandler } from '../src/websocket-handler';
import { NgxsWebSocketPluginModule, ConnectWebSocket } from '../';

describe('WebSocketHandler cleanup', () => {
  mockWebSocket();

  const url = 'ws://localhost:8080';

  @Component({
    selector: 'app-root',
    template: '',
    standalone: false
  })
  class TestComponent {}

  @NgModule({
    imports: [
      BrowserModule,
      NgxsModule.forRoot([]),
      NgxsWebSocketPluginModule.forRoot({ url })
    ],
    declarations: [TestComponent],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should cleanup subscriptions when the root view is destroyed',
    freshPlatform(async done => {
      // Arrange & act
      const server = new Server(url);
      const ngModuleRef = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const store = ngModuleRef.injector.get(Store);
      const webSocketHandler = ngModuleRef.injector.get(WebSocketHandler);
      const nextSpy = jest.fn();
      webSocketHandler['_destroy$'].subscribe(nextSpy);

      store.dispatch(new ConnectWebSocket());

      server.on('connection', () => {
        server.on('close', () => {
          try {
            // Assert
            expect(nextSpy).toHaveBeenCalled();
          } finally {
            server.stop(done);
          }
        });

        // This will also close the existing connection and will emit the `close` event that we
        // added a listener for previously.
        ngModuleRef.destroy();
      });
    })
  );
});
