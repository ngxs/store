import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, Component, Injectable } from '@angular/core';
import { Action, State, StateContext, Store, provideStore } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { withNgxsStoragePlugin, withNgxsStorageSync } from '..';

describe('withNgxsStorageSync', () => {
  interface CounterStateModel {
    count: number;
  }

  class Increment {
    static readonly type = '[Counter] Increment';
  }

  @State<CounterStateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment(ctx: StateContext<CounterStateModel>) {
      ctx.patchState({ count: ctx.getState().count + 1 });
    }
  }

  @Component({ selector: 'app-root', template: '', standalone: true })
  class TestComponent {}

  function bootstrap() {
    const appConfig: ApplicationConfig = {
      providers: [
        provideStore(
          [CounterState],
          withNgxsStoragePlugin({ keys: [CounterState] }, withNgxsStorageSync())
        )
      ]
    };

    return skipConsoleLogging(() => bootstrapApplication(TestComponent, appConfig));
  }

  /** Simulates another tab writing `key` in the same `localStorage` origin. */
  function writeFromAnotherTab(key: string, oldValue: string | null, newValue: string | null) {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key,
        oldValue,
        newValue,
        storageArea: localStorage
      })
    );
  }

  afterEach(() => {
    localStorage.removeItem('counter');
  });

  it(
    'should rehydrate the matching slice of state when another tab writes to its key',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await bootstrap();
      const store = injector.get(Store);
      expect(store.snapshot()).toEqual({ counter: { count: 0 } });

      // Act — another tab persisted `{ count: 42 }` under the `counter` key.
      writeFromAnotherTab('counter', null, JSON.stringify({ count: 42 }));

      // Assert
      expect(store.snapshot()).toEqual({ counter: { count: 42 } });
    })
  );

  it(
    'should ignore StorageEvents for keys the plugin does not manage',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await bootstrap();
      const store = injector.get(Store);

      // Act
      writeFromAnotherTab('some-other-key', null, JSON.stringify({ irrelevant: true }));

      // Assert
      expect(store.snapshot()).toEqual({ counter: { count: 0 } });
    })
  );

  it(
    'should ignore StorageEvents from a storage area other than the one the key uses',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await bootstrap();
      const store = injector.get(Store);

      // Act — same key, but reported against `sessionStorage`, which this
      // config never resolves `counter` to.
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'counter',
          oldValue: null,
          newValue: JSON.stringify({ count: 99 }),
          storageArea: sessionStorage
        })
      );

      // Assert
      expect(store.snapshot()).toEqual({ counter: { count: 0 } });
    })
  );

  it(
    'should log and skip rather than throw when the new value fails to deserialize',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await bootstrap();
      const store = injector.get(Store);
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Act
        writeFromAnotherTab('counter', null, '{not valid json');

        // Assert
        expect(store.snapshot()).toEqual({ counter: { count: 0 } });
        expect(spy).toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    })
  );

  it(
    'should keep syncing after further local dispatches',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await bootstrap();
      const store = injector.get(Store);
      store.dispatch(new Increment());
      expect(store.snapshot()).toEqual({ counter: { count: 1 } });

      // Act
      writeFromAnotherTab('counter', null, JSON.stringify({ count: 7 }));

      // Assert
      expect(store.snapshot()).toEqual({ counter: { count: 7 } });
    })
  );
});
