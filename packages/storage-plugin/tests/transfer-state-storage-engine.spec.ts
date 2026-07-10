import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import {
  APP_ID,
  ApplicationConfig,
  Component,
  EnvironmentProviders,
  Injectable,
  Provider,
  TransferState,
  Type,
  inject,
  makeEnvironmentProviders,
  makeStateKey
} from '@angular/core';
import {
  Action,
  State,
  StateContext,
  Store,
  provideStore,
  withNgxsPlugin,
  type NgxsNextPluginFn
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { STORAGE_ENGINE, StorageEngine, withNgxsStoragePlugin } from '../';

declare const ngServerMode: boolean;

describe('TransferStateStorageEngine', () => {
  // `ngServerMode` is normally guaranteed to be a real boolean by Angular CLI's
  // build-time `define` substitution (like `ngDevMode`), so production code —
  // including the class below — can reference it bare, unguarded by `typeof`.
  // Jest doesn't go through that build step, so nothing defines the global
  // until a test sets it; without this, the very first bare `ngServerMode`
  // read would throw `ReferenceError` instead of evaluating to `false`.
  beforeEach(() => {
    (globalThis as any).ngServerMode = false;
  });

  // The exact `TransferStateStorageEngine` used in the real app: reads a value
  // from `TransferState` the first time a key is requested (i.e. right after
  // hydration on the client), writes it through to the wrapped `STORAGE_ENGINE`
  // so it survives future reloads, and falls back to the wrapped engine for
  // every subsequent read. Registered per-key as a class reference
  // (`engine: TransferStateStorageEngine`), so it's resolved via
  // `injector.get(TransferStateStorageEngine)` rather than a factory function.
  @Injectable({ providedIn: 'root' })
  class TransferStateStorageEngine implements StorageEngine {
    private readonly engine = inject(STORAGE_ENGINE);
    private readonly transferState = inject(TransferState);

    // We're going to get values from the transfer state only once
    // and then fall back to using `localStorage`.
    readonly #keysWhichHaveBeenRead = new Set<string>();

    getItem(key: string) {
      // This should not be required because NgxsStoragePlugin does not
      // execute on server, but we'll keep it here as precaution.
      if (ngServerMode) {
        return null;
      }

      if (!this.#keysWhichHaveBeenRead.has(key)) {
        const stateKey = makeStateKey<unknown>(`ngxs:${key}`);

        if (this.transferState.hasKey(stateKey)) {
          this.#keysWhichHaveBeenRead.add(key);

          // Serialize it back to a string because the storage plugin will
          // attempt to call `deserialize` (which defaults to `JSON.parse`).
          const value = JSON.stringify(this.transferState.get(stateKey, null));

          // Save the value to the storage so it has the value from the transfer state
          // and not the last value from the storage engine.
          this.setItem(key, value);

          return value;
        }
      }

      return this.engine.getItem(key);
    }

    setItem(key: string, value: unknown): void {
      this.engine.setItem(key, value);
    }
  }

  interface NgxsTransferStatePluginOptions {
    keys: string[];
    namespace?: string;
  }

  // The server-side counterpart of `TransferStateStorageEngine`: an NGXS plugin
  // that only registers itself when `ngServerMode` is true, and mirrors the
  // requested state slices into `TransferState` on every dispatched action so
  // the client can pick them up on first hydration. Note it snapshots `state`
  // as it enters the pipeline (i.e. *before* the current action's reducers
  // run), so it always trails by one action — same as in a real app, where
  // further actions (e.g. a router navigation) keep firing after a value like
  // an auth token is set.
  function withNgxsTransferStatePlugin(options: NgxsTransferStatePluginOptions) {
    return ngServerMode ? withNgxsPlugin(transferStatePlugin) : makeEnvironmentProviders([]);

    function transferStatePlugin(state: any, action: any, next: NgxsNextPluginFn) {
      setState();
      return next(state, action);

      function setState() {
        const transferState = inject(TransferState);

        for (const key of options.keys) {
          if (state[key]) {
            const stateKey = makeStateKey<unknown>(
              options.namespace ? `ngxs:${options.namespace}:${key}` : `ngxs:${key}`
            );
            transferState.set(stateKey, state[key]);
          }
        }
      }
    }
  }

  interface AuthStateModel {
    token: string | null;
  }

  class SetToken {
    static readonly type = '[Auth] SetToken';
    constructor(public token: string) {}
  }

  @State<AuthStateModel>({ name: 'auth', defaults: { token: null } })
  @Injectable()
  class AuthState {
    @Action(SetToken)
    setToken(ctx: StateContext<AuthStateModel>, { token }: SetToken) {
      ctx.patchState({ token });
    }
  }

  @Component({ selector: 'app-root', template: '', standalone: true })
  class TestComponent {}

  // The storage plugin prefixes keys with the configured `namespace`, so the
  // key actually handed to `TransferStateStorageEngine.getItem`/`setItem` is
  // `gym:auth`, matching how the real app registers this plugin:
  //
  // withNgxsStoragePlugin({
  //   namespace: 'gym',
  //   keys: ['resetpassword', { key: 'auth', engine: TransferStateStorageEngine }]
  // })
  const NAMESPACED_KEY = 'gym:auth';
  const TRANSFER_STATE_KEY = makeStateKey<unknown>(`ngxs:${NAMESPACED_KEY}`);
  const APP_ID_VALUE = 'ngxs-storage-test';

  // The wrapped engine is real `localStorage` — `withNgxsStoragePlugin` resolves
  // `STORAGE_ENGINE` to it by default, so there's nothing to override here, same
  // as in the real app's config.
  afterEach(() => {
    localStorage.removeItem(NAMESPACED_KEY);
  });

  /**
   * Bootstraps the client app under test.
   *
   * `transferState` is omitted when the test wants the *real* client-side
   * `TransferState` factory to run (i.e. read whatever `<script id="...-state">`
   * is currently sitting in `document`) rather than a manually seeded instance —
   * see `ssr`/`prepareEnvironment` below for that flow.
   */
  function hydrate(transferState?: TransferState) {
    const appConfig: ApplicationConfig = {
      providers: [
        { provide: APP_ID, useValue: APP_ID_VALUE },

        // `TransferStateStorageEngine` is `providedIn: 'root'`, so — same as in
        // the real app — it doesn't need to be listed here explicitly.
        provideStore(
          [AuthState],
          withNgxsStoragePlugin({
            namespace: 'gym',
            keys: [{ key: 'auth', engine: TransferStateStorageEngine }]
          })
        ),

        ...(transferState ? [{ provide: TransferState, useValue: transferState }] : [])
      ]
    };

    return skipConsoleLogging(() => bootstrapApplication(TestComponent, appConfig));
  }

  /**
   * Renders `component` on the "server", exactly like a production SSR
   * request: `provideServerRendering()` wires up the `TransferState`
   * serialization hook that embeds a `<script id="{appId}-state">` tag into
   * the rendered HTML. Returns that HTML plus the `TransferState` instance
   * the render populated, for sanity-check assertions.
   *
   * `providers` is a factory — not a plain array — for the same reason
   * Angular's own hydration test helpers take `hydrationFeatures: () => [...]`
   * rather than a value: anything that reads `ngServerMode` (like
   * `withNgxsTransferStatePlugin` below) must only be evaluated *after*
   * `ngServerMode` is flipped on, not when the caller builds the argument.
   *
   * `ngServerMode` is a real Angular global (not just an ngxs convention —
   * Angular's own runtime reads it too), and `provideServerRendering()` sets
   * it but never unsets it, so it's manually restored afterwards — mirroring
   * how Angular's own SSR/hydration tests do it.
   */
  async function ssr(
    component: Type<unknown>,
    providers: () => (Provider | EnvironmentProviders)[]
  ): Promise<{ html: string; transferState: TransferState }> {
    let transferState!: TransferState;

    try {
      (globalThis as any).ngServerMode = true;

      const html = await skipConsoleLogging(() =>
        renderApplication(
          context =>
            bootstrapApplication(
              component,
              {
                providers: [
                  { provide: APP_ID, useValue: APP_ID_VALUE },
                  provideServerRendering(),
                  // Captured for the sanity-check assertion below; behaviorally
                  // identical to the real `providedIn: 'root'` factory, which
                  // also starts empty while `ngServerMode` is true.
                  {
                    provide: TransferState,
                    useFactory: () => (transferState = new TransferState())
                  },
                  ...providers()
                ]
              },
              context
            ),
          { document: '<app-root></app-root>', url: '/' }
        )
      );

      return { html, transferState };
    } finally {
      (globalThis as any).ngServerMode = false;
    }
  }

  function extractTransferStateScript(html: string, appId: string): string {
    const match = html.match(
      new RegExp(`<script[^>]*id="${appId}-state"[^>]*>([\\s\\S]*?)</script>`)
    );
    if (!match) {
      throw new Error(`Could not find the "${appId}-state" transfer-state script in: ${html}`);
    }
    return match[1];
  }

  /**
   * Inserts the exact `<script id="{appId}-state">` tag the browser would have
   * received embedded in the server-rendered page into the real `document`, so
   * the client's (non-overridden) `TransferState` factory picks it up via
   * `document.getElementById`. Returns a cleanup function that removes it.
   */
  function prepareEnvironment(html: string): VoidFunction {
    const scriptContent = extractTransferStateScript(html, APP_ID_VALUE);

    const script = document.createElement('script');
    script.id = `${APP_ID_VALUE}-state`;
    // Angular emits this as `application/json` so browsers (and jsdom) don't
    // try to execute it as JavaScript.
    script.setAttribute('type', 'application/json');
    script.textContent = scriptContent;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }

  it(
    'should hydrate the store from TransferState on bootstrap and persist the value to localStorage',
    freshPlatform(async () => {
      // Arrange — seed `TransferState` the way it would be populated on the client
      // right after an SSR response embeds the serialized server-rendered state.
      const transferState = new TransferState();
      transferState.set(TRANSFER_STATE_KEY, { token: 'server-token' });

      // Act
      const { injector } = await hydrate(transferState);

      // Assert — the store was hydrated straight from TransferState on bootstrap ...
      expect(injector.get(Store).snapshot()).toEqual({ auth: { token: 'server-token' } });

      // ... and the value was written through to localStorage so it survives a
      // future reload where TransferState is no longer populated.
      expect(localStorage.getItem(NAMESPACED_KEY)).toBe(
        JSON.stringify({ token: 'server-token' })
      );
    })
  );

  it(
    'should fall back to localStorage on a later bootstrap where TransferState is empty',
    freshPlatform(async () => {
      // Arrange — simulate the *next* navigation/reload: TransferState is empty
      // (nothing embedded for this request), but localStorage already holds the
      // value persisted from a previous bootstrap.
      const transferState = new TransferState();
      localStorage.setItem(NAMESPACED_KEY, JSON.stringify({ token: 'cached-token' }));

      // Act
      const { injector } = await hydrate(transferState);

      // Assert
      expect(injector.get(Store).snapshot()).toEqual({ auth: { token: 'cached-token' } });
    })
  );

  it(
    'should persist further state changes to localStorage through the normal dispatch flow',
    freshPlatform(async () => {
      // Arrange
      const transferState = new TransferState();
      transferState.set(TRANSFER_STATE_KEY, { token: 'server-token' });

      // Act
      const { injector } = await hydrate(transferState);
      injector.get(Store).dispatch(new SetToken('refreshed-token'));

      // Assert — the dispatched action went through the plugin's normal write
      // path (`engine.setItem`), not the TransferState-specific bootstrap path.
      expect(injector.get(Store).snapshot()).toEqual({ auth: { token: 'refreshed-token' } });
      expect(localStorage.getItem(NAMESPACED_KEY)).toBe(
        JSON.stringify({ token: 'refreshed-token' })
      );
    })
  );

  // A dedicated root component for the "server" bootstrap: dispatching from
  // its constructor is the SSR-test equivalent of a real app dispatching more
  // actions after the token is set (e.g. a router navigation) — see the note
  // on `withNgxsTransferStatePlugin` above about it trailing by one action.
  @Component({ selector: 'app-root', template: '', standalone: true })
  class ServerTestComponent {
    private readonly store = inject(Store);

    constructor() {
      this.store.dispatch(new SetToken('server-token'));
      this.store.dispatch(new SetToken('server-token'));
    }
  }

  it(
    'should hydrate through a real SSR round trip, the same way Angular tests its own hydration',
    freshPlatform(async () => {
      // Arrange
      const { html, transferState: serverTransferState } = await ssr(
        ServerTestComponent,
        () => [
          provideStore(
            [AuthState],
            withNgxsTransferStatePlugin({ namespace: 'gym', keys: ['auth'] })
          )
        ]
      );

      // Sanity check: the server actually serialized the auth state.
      expect(JSON.parse(serverTransferState.toJson())).toEqual({
        [TRANSFER_STATE_KEY]: { token: 'server-token' }
      });

      const cleanupEnvironment = prepareEnvironment(html);

      try {
        // Act
        const { injector } = await hydrate();

        // Assert
        expect(injector.get(Store).snapshot()).toEqual({ auth: { token: 'server-token' } });
        expect(localStorage.getItem(NAMESPACED_KEY)).toBe(
          JSON.stringify({ token: 'server-token' })
        );
      } finally {
        cleanupEnvironment();
      }
    })
  );
});
