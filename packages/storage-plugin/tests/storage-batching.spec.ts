import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, Component, Injectable, inject } from '@angular/core';
import { Action, State, StateContext, Store, provideStore } from '@ngxs/store';
import { StorageEngine } from '@ngxs/storage-plugin/internals';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import {
  NGXS_STORAGE_ENGINE_TO_WRAP,
  NgxsBatchingStorageEngine,
  withNgxsStorageBatching,
  withNgxsStorageDefaultBatching,
  withNgxsStoragePlugin
} from '..';

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

describe('withNgxsStorageDefaultBatching', () => {
  /** A trivial in-memory engine, used to prove explicit per-key engines bypass batching. */
  class FakeEngine implements StorageEngine {
    readonly calls: Array<[string, any]> = [];
    private _store = new Map<string, any>();

    getItem(key: string) {
      return this._store.has(key) ? this._store.get(key) : null;
    }

    setItem(key: string, value: any) {
      this.calls.push([key, value]);
      this._store.set(key, value);
    }
  }

  function bootstrap(keys: any[] = [CounterState], debounceTime?: number) {
    const appConfig: ApplicationConfig = {
      providers: [
        provideStore(
          [CounterState],
          withNgxsStoragePlugin({ keys }, withNgxsStorageDefaultBatching({ debounceTime }))
        )
      ]
    };

    return skipConsoleLogging(() => bootstrapApplication(TestComponent, appConfig));
  }

  afterEach(() => {
    localStorage.removeItem('counter');
  });

  it(
    'should not write to the storage engine until the debounce window elapses',
    freshPlatform(async () => {
      // Arrange
      jest.useFakeTimers();
      const { injector } = await bootstrap([CounterState], 300);
      const store = injector.get(Store);

      try {
        // Act
        store.dispatch(new Increment());

        // Assert — nothing written yet, synchronously after the dispatch.
        expect(localStorage.getItem('counter')).toBeNull();

        jest.advanceTimersByTime(300);
        expect(localStorage.getItem('counter')).toBe(JSON.stringify({ count: 1 }));
      } finally {
        jest.useRealTimers();
      }
    })
  );

  it(
    'should coalesce rapid successive writes into a single underlying write',
    freshPlatform(async () => {
      // Arrange
      jest.useFakeTimers();
      const { injector } = await bootstrap([CounterState], 300);
      const store = injector.get(Store);
      const spy = jest.spyOn(Storage.prototype, 'setItem');

      try {
        // Act — three dispatches within the same debounce window.
        store.dispatch(new Increment());
        jest.advanceTimersByTime(100);
        store.dispatch(new Increment());
        jest.advanceTimersByTime(100);
        store.dispatch(new Increment());
        jest.advanceTimersByTime(300);

        // Assert — only the final value was ever written for this key.
        const counterCalls = spy.mock.calls.filter(([key]) => key === 'counter');
        expect(counterCalls).toEqual([['counter', JSON.stringify({ count: 3 })]]);
      } finally {
        spy.mockRestore();
        jest.useRealTimers();
      }
    })
  );

  it(
    'should flush pending writes immediately when the page becomes hidden',
    freshPlatform(async () => {
      // Arrange
      jest.useFakeTimers();
      const { injector } = await bootstrap([CounterState], 300);
      const store = injector.get(Store);

      try {
        // Act
        store.dispatch(new Increment());
        expect(localStorage.getItem('counter')).toBeNull();

        jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        document.dispatchEvent(new Event('visibilitychange'));

        // Assert — flushed without waiting for the debounce timer.
        expect(localStorage.getItem('counter')).toBe(JSON.stringify({ count: 1 }));
      } finally {
        jest.restoreAllMocks();
        jest.useRealTimers();
      }
    })
  );

  it(
    'should flush pending writes immediately on pagehide',
    freshPlatform(async () => {
      // Arrange
      jest.useFakeTimers();
      const { injector } = await bootstrap([CounterState], 300);
      const store = injector.get(Store);

      try {
        // Act
        store.dispatch(new Increment());
        expect(localStorage.getItem('counter')).toBeNull();

        window.dispatchEvent(new Event('pagehide'));

        // Assert
        expect(localStorage.getItem('counter')).toBe(JSON.stringify({ count: 1 }));
      } finally {
        jest.useRealTimers();
      }
    })
  );

  it(
    'should leave keys with an explicit custom engine writing through immediately',
    freshPlatform(async () => {
      // Arrange
      jest.useFakeTimers();
      const fakeEngine = new FakeEngine();
      const { injector } = await bootstrap(
        [{ key: CounterState, engine: () => fakeEngine }],
        300
      );
      const store = injector.get(Store);

      try {
        // Act — no timer advance at all.
        store.dispatch(new Increment());

        // Assert — the explicit engine isn't wrapped by the batching feature.
        expect(fakeEngine.calls).toEqual([['counter', JSON.stringify({ count: 1 })]]);
      } finally {
        jest.useRealTimers();
      }
    })
  );
});

describe('withNgxsStorageBatching (custom engine)', () => {
  /** Buffers writes and only ever commits them when `flush()` is called explicitly. */
  @Injectable()
  class ManualFlushEngine implements NgxsBatchingStorageEngine {
    private readonly _engine = inject(NGXS_STORAGE_ENGINE_TO_WRAP)!;
    private readonly _pending = new Map<string, any>();

    getItem(key: string): any {
      return this._pending.has(key) ? this._pending.get(key) : this._engine.getItem(key);
    }

    setItem(key: string, value: any): void {
      this._pending.set(key, value);
    }

    flush(): void {
      for (const [key, value] of this._pending) {
        this._engine.setItem(key, value);
      }
      this._pending.clear();
    }
  }

  function bootstrap() {
    const appConfig: ApplicationConfig = {
      providers: [
        provideStore(
          [CounterState],
          withNgxsStoragePlugin(
            { keys: [CounterState] },
            withNgxsStorageBatching(ManualFlushEngine)
          )
        )
      ]
    };

    return skipConsoleLogging(() => bootstrapApplication(TestComponent, appConfig));
  }

  afterEach(() => {
    localStorage.removeItem('counter');
  });

  it(
    'should let a user-supplied engine control buffering while still flushing it on hide',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await bootstrap();
      const store = injector.get(Store);

      try {
        // Act
        store.dispatch(new Increment());

        // Assert — the custom engine never writes through on its own.
        expect(localStorage.getItem('counter')).toBeNull();

        jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        document.dispatchEvent(new Event('visibilitychange'));

        // The generic flush-on-hide wiring still calls the custom engine's `flush()`.
        expect(localStorage.getItem('counter')).toBe(JSON.stringify({ count: 1 }));
      } finally {
        jest.restoreAllMocks();
      }
    })
  );
});
