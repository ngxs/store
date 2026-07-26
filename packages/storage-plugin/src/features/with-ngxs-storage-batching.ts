import {
  DestroyRef,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  NgZone,
  Type,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer
} from '@angular/core';
import {
  STORAGE_ENGINE,
  StorageEngine,
  ɵNGXS_STORAGE_PLUGIN_OPTIONS
} from '@ngxs/storage-plugin/internals';

import { engineFactory } from '../internals';

declare const ngDevMode: boolean;

/**
 * The real engine your batching engine should wrap — `localStorage`,
 * `sessionStorage`, or whatever the plugin's config resolves to. `null` on
 * the server, same as `STORAGE_ENGINE` would be.
 *
 * @experimental This API is experimental and may change in any release.
 */
export const NGXS_STORAGE_ENGINE_TO_WRAP =
  /* @__PURE__ */ new InjectionToken<StorageEngine | null>(
    typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_STORAGE_ENGINE_TO_WRAP' : '',
    {
      factory: () => engineFactory(inject(ɵNGXS_STORAGE_PLUGIN_OPTIONS))
    }
  );

/**
 * What a custom engine passed to `withNgxsStorageBatching()` needs to
 * implement: the usual `StorageEngine` methods, plus `flush()`. We call
 * `flush()` whenever the page might be about to disappear, so whatever
 * you're buffering doesn't get lost.
 *
 * @experimental This API is experimental and may change in any release.
 */
export interface NgxsBatchingStorageEngine extends StorageEngine {
  flush(): void;
}

/**
 * Makes `engine` the storage engine the plugin writes through, built via DI
 * so it can `inject(NGXS_STORAGE_ENGINE_TO_WRAP)` to get the real one
 * underneath. How it buffers or coalesces writes is entirely up to `engine`
 * — this just makes sure `flush()` gets called before the page disappears
 * (hidden, unloaded, or the injector is destroyed), so nothing gets lost.
 *
 * Just want the built-in debounce behavior instead of writing your own
 * engine? Use `withNgxsStorageDefaultBatching()`.
 *
 * Pass this as a feature to `withNgxsStoragePlugin()`, e.g.
 * `withNgxsStoragePlugin({ keys: [...] }, withNgxsStorageBatching(MyEngine))`.
 * Only affects keys on the default engine — a key with its own explicit
 * `StorageEngine` keeps writing through immediately.
 *
 * @experimental This API is experimental and may change in any release.
 */
export function withNgxsStorageBatching(
  engine: Type<NgxsBatchingStorageEngine>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    engine,
    {
      provide: STORAGE_ENGINE,
      useFactory: (): NgxsBatchingStorageEngine | null =>
        inject(NGXS_STORAGE_ENGINE_TO_WRAP) && inject(engine)
    },
    provideEnvironmentInitializer(() => {
      const batchingEngine = inject(STORAGE_ENGINE) as NgxsBatchingStorageEngine | null;
      // Null on the server — nothing to flush there.
      if (!batchingEngine) {
        return;
      }

      const flush = () => batchingEngine.flush();
      const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') flush();
      };

      const ngZone = inject(NgZone);
      ngZone.runOutsideAngular(() => {
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('pagehide', flush);
      });

      inject(DestroyRef).onDestroy(() => {
        flush();
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('pagehide', flush);
      });
    })
  ]);
}

/**
 * @experimental This API is experimental and may change in any release.
 */
export interface NgxsStorageBatchingOptions {
  /**
   * How long to wait, in ms, after the last write before actually saving to
   * storage. Every new write resets the clock — same idea as RxJS's
   * `debounceTime`. Defaults to 300.
   */
  debounceTime?: number;
}

const ɵNGXS_STORAGE_BATCHING_OPTIONS = new InjectionToken<
  Required<NgxsStorageBatchingOptions>
>(typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_STORAGE_BATCHING_OPTIONS' : '');

/**
 * The easy option: instead of writing to storage on every single dispatch,
 * this waits until writes go quiet for `debounceTime` ms and saves once.
 * Handy when state changes rapidly, e.g. while dragging something or typing
 * into a form. See `withNgxsStorageBatching()` for how we avoid losing that
 * last write if the page closes mid-debounce.
 *
 * Pass this as a feature to `withNgxsStoragePlugin()`, e.g.
 * `withNgxsStoragePlugin({ keys: [...] }, withNgxsStorageDefaultBatching())`.
 *
 * @experimental This API is experimental and may change in any release.
 */
export function withNgxsStorageDefaultBatching(
  options: NgxsStorageBatchingOptions = {}
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ɵNGXS_STORAGE_BATCHING_OPTIONS,
      useValue: { debounceTime: options.debounceTime ?? 300 }
    },
    withNgxsStorageBatching(ɵBatchingStorageEngine)
  ]);
}

/**
 * The default batching engine. Holds writes in memory until `flush()` runs,
 * so a burst of writes to the same key ends up costing one real write.
 * `getItem` checks that in-memory buffer first, so you never read a stale
 * value for something you just wrote.
 */
@Injectable()
class ɵBatchingStorageEngine implements NgxsBatchingStorageEngine {
  private readonly _engine = inject(NGXS_STORAGE_ENGINE_TO_WRAP)!;
  private readonly _ngZone = inject(NgZone);
  private readonly _debounceTime = inject(ɵNGXS_STORAGE_BATCHING_OPTIONS).debounceTime;

  private readonly _pending = new Map<string, any>();
  private _timeoutId: ReturnType<typeof setTimeout> | null = null;

  getItem(key: string): any {
    return this._pending.has(key) ? this._pending.get(key) : this._engine.getItem(key);
  }

  setItem(key: string, value: any): void {
    this._pending.set(key, value);

    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
    }
    this._timeoutId = this._ngZone.runOutsideAngular(() =>
      setTimeout(() => this.flush(), this._debounceTime)
    );
  }

  flush(): void {
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }

    if (this._pending.size === 0) {
      return;
    }

    for (const [key, value] of this._pending) {
      this._engine.setItem(key, value);
    }
    this._pending.clear();
  }
}
