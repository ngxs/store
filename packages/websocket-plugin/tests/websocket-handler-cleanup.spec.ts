import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { DispatchOutsideZoneNgxsExecutionStrategy, NgxsModule, Store } from '@ngxs/store';
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
      NgxsModule.forRoot([], {
        executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
      }),
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
      // @ts-expect-error private property.
      const spy = jest.spyOn(webSocketHandler, '_closeConnection');

      store.dispatch(new ConnectWebSocket());

      server.on('connection', () => {
        server.on('close', () => {
          try {
            // Assert
            expect(spy).toHaveBeenCalledWith(/* forcelyCloseSocket */ true);
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
