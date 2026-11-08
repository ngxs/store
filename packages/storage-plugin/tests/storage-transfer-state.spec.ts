import { TestBed } from '@angular/core/testing';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import {
  APP_ID,
  ApplicationConfig,
  Component,
  EnvironmentInjector,
  EnvironmentProviders,
  Injectable,
  Provider,
  TransferState,
  Type,
  createEnvironmentInjector,
  inject,
  makeStateKey
} from '@angular/core';
import { Action, State, StateContext, Store, provideStates, provideStore } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { NgxsStoragePluginOptions, ɵDEFAULT_STATE_KEY } from '@ngxs/storage-plugin/internals';

import {
  NgxsStorageTransferStateOptions,
  STORAGE_ENGINE,
  StorageEngine,
  withNgxsStoragePlugin,
  withNgxsStorageTransferState
} from '../';
import { ɵSTORAGE_TRANSFER_STATE } from '../src/transfer-state';

describe('withNgxsStorageTransferState', () => {
  // Jest does not do the `define` replace of the Angular CLI build, so nobody
  // sets this global before a test sets it.
  beforeEach(() => {
    (globalThis as any).ngServerMode = false;
  });

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

  @State<{ count: number }>({ name: 'counter', defaults: { count: 0 } })
  @Injectable()
  class CounterState {}

  @State<{ loaded: boolean }>({ name: 'other', defaults: { loaded: true } })
  @Injectable()
  class OtherState {}

  class InMemoryEngine implements StorageEngine {
    readonly items = new Map<string, string>();

    getItem(key: string) {
      return this.items.get(key) ?? null;
    }

    setItem(key: string, value: string) {
      this.items.set(key, value);
    }
  }

  function transferStateKey(key: string, namespace?: string) {
    return makeStateKey<unknown>(`ngxs.storage:${namespace ? `${namespace}:` : ''}${key}`);
  }

  interface SetupOptions {
    states?: any[];
    plugin: NgxsStoragePluginOptions;
    transfer: NgxsStorageTransferStateOptions;
    /** Values for `TransferState`, like the server made them. */
    seed?: Record<string, unknown>;
    engine?: InMemoryEngine;
  }

  function setup(options: SetupOptions) {
    const engine = options.engine ?? new InMemoryEngine();
    const transferState = new TransferState();

    for (const [key, value] of Object.entries(options.seed ?? {})) {
      transferState.set(transferStateKey(key, options.plugin.namespace), value);
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: TransferState, useValue: transferState },
        provideStore(
          options.states ?? [AuthState],
          withNgxsStoragePlugin(options.plugin, withNgxsStorageTransferState(options.transfer))
        ),
        { provide: STORAGE_ENGINE, useValue: engine }
      ]
    });

    const store = TestBed.inject(Store);
    return { store, engine, transferState };
  }

  /** Adds a state after bootstrap, like a lazy route does. */
  function addFeatureStates(states: any[]) {
    const parent = TestBed.inject(EnvironmentInjector);
    createEnvironmentInjector([provideStates(states)], parent);
  }

  describe('reading on the client', () => {
    it('should populate the state from TransferState', () => {
      // Arrange & Act
      const { store } = setup({
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Assert
      expect(store.snapshot()).toEqual({ auth: { token: 'server-token' } });
    });

    it('should win over a different value already in the engine', () => {
      // Arrange
      const engine = new InMemoryEngine();
      engine.setItem('auth', JSON.stringify({ token: 'stale-token' }));

      // Act
      const { store } = setup({
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } },
        engine
      });

      // Assert
      expect(store.snapshot()).toEqual({ auth: { token: 'server-token' } });
    });

    it('should write the transferred value back to the engine', () => {
      // Arrange & Act
      const { engine } = setup({
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Assert
      expect(engine.getItem('auth')).toBe(JSON.stringify({ token: 'server-token' }));
    });

    it('should run afterDeserialize but not deserialize for a transferred value', () => {
      // Arrange
      const deserialize = jest.fn(JSON.parse);
      const afterDeserialize = jest.fn((value: any) => value);

      // Act
      setup({
        plugin: { keys: ['auth'], deserialize, afterDeserialize },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Assert
      expect(deserialize).not.toHaveBeenCalled();
      expect(afterDeserialize).toHaveBeenCalledWith({ token: 'server-token' }, 'auth');
    });

    it('should read a key the feature does not cover from the engine', () => {
      // Arrange
      const engine = new InMemoryEngine();
      engine.setItem('counter', JSON.stringify({ count: 42 }));

      // Act
      const { store } = setup({
        states: [AuthState, CounterState],
        plugin: { keys: ['auth', 'counter'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } },
        engine
      });

      // Assert
      expect(store.snapshot()).toEqual({
        auth: { token: 'server-token' },
        counter: { count: 42 }
      });
    });

    it('should take a transferred value only once', () => {
      // Arrange & Act
      setup({
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Assert
      expect(TestBed.inject(ɵSTORAGE_TRANSFER_STATE)!.take('auth')).toBeUndefined();
    });

    it('should not re-apply a transferred value when an unrelated state is added', () => {
      // Arrange
      const { store } = setup({
        states: [AuthState],
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      store.dispatch(new SetToken('newer-token'));

      // Act
      addFeatureStates([OtherState]);

      // Assert
      expect(store.snapshot().auth).toEqual({ token: 'newer-token' });
    });

    it('should apply the namespace to the TransferState key', () => {
      // Arrange & Act
      const { store } = setup({
        plugin: { namespace: 'gym', keys: ['auth'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Assert
      expect(store.snapshot()).toEqual({ auth: { token: 'server-token' } });
    });
  });

  describe('persist: false', () => {
    it('should populate the state and leave the engine untouched', () => {
      // Arrange
      const engine = new InMemoryEngine();
      const setItem = jest.spyOn(engine, 'setItem');

      // Act
      const { store } = setup({
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'], persist: false },
        seed: { auth: { token: 'server-token' } },
        engine
      });

      // Assert
      expect(store.snapshot()).toEqual({ auth: { token: 'server-token' } });
      expect(setItem).not.toHaveBeenCalled();
    });

    it('should not read the engine for a covered key', () => {
      // Arrange
      const engine = new InMemoryEngine();
      engine.setItem('auth', JSON.stringify({ token: 'stale-token' }));

      // Act
      const { store } = setup({
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'], persist: false },
        engine
      });

      // Assert
      expect(store.snapshot()).toEqual({ auth: { token: null } });
    });

    it('should not stop other keys being persisted', () => {
      // Arrange
      const { store, engine } = setup({
        states: [AuthState, CounterState],
        plugin: { keys: ['auth', 'counter'] },
        transfer: { keys: ['auth'], persist: false },
        seed: { auth: { token: 'server-token' } }
      });

      // Act
      store.dispatch(new SetToken('newer-token'));

      // Assert
      expect(engine.getItem('counter')).toBe(JSON.stringify({ count: 0 }));
      expect(engine.getItem('auth')).toBeNull();
    });

    it('should still write the whole blob when the plugin uses keys "*"', () => {
      // Arrange
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Act
        const { engine } = setup({
          states: [AuthState, CounterState],
          plugin: { keys: '*' },
          transfer: { keys: ['auth'], persist: false },
          seed: { auth: { token: 'server-token' } }
        });

        // Assert
        expect(JSON.parse(engine.getItem(ɵDEFAULT_STATE_KEY)!)).toEqual({
          auth: { token: 'server-token' },
          counter: { count: 0 }
        });
      } finally {
        consoleError.mockRestore();
      }
    });
  });

  describe('keys: "*"', () => {
    it('should overlay the transferred slice when the engine is empty', () => {
      // Arrange & Act
      const { store } = setup({
        states: [AuthState, CounterState],
        plugin: { keys: '*' },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Assert
      expect(store.snapshot()).toEqual({
        auth: { token: 'server-token' },
        counter: { count: 0 }
      });
    });

    it('should write the blob back to the engine after overlaying', () => {
      // Arrange & Act
      const { engine } = setup({
        states: [AuthState, CounterState],
        plugin: { keys: '*' },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Assert
      expect(JSON.parse(engine.getItem(ɵDEFAULT_STATE_KEY)!)).toEqual({
        auth: { token: 'server-token' },
        counter: { count: 0 }
      });
    });

    it('should overlay the transferred slice over the stored blob', () => {
      // Arrange
      const engine = new InMemoryEngine();
      engine.setItem(
        ɵDEFAULT_STATE_KEY,
        JSON.stringify({ auth: { token: 'stale-token' }, counter: { count: 7 } })
      );

      // Act
      const { store } = setup({
        states: [AuthState, CounterState],
        plugin: { keys: '*' },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } },
        engine
      });

      // Assert
      expect(store.snapshot()).toEqual({
        auth: { token: 'server-token' },
        counter: { count: 7 }
      });
    });
  });

  describe('writing on init', () => {
    it('should not rewrite keys that took no transferred value', () => {
      // Arrange
      const engine = new InMemoryEngine();
      const setItem = jest.spyOn(engine, 'setItem');

      // Act
      setup({
        states: [AuthState, CounterState],
        plugin: { keys: ['auth', 'counter'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } },
        engine
      });

      // Assert
      expect(setItem).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith('auth', JSON.stringify({ token: 'server-token' }));
    });

    it('should not write anything when nothing was transferred', () => {
      // Arrange
      const engine = new InMemoryEngine();
      const setItem = jest.spyOn(engine, 'setItem');

      // Act
      setup({
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'] },
        engine
      });

      // Assert
      expect(setItem).not.toHaveBeenCalled();
    });
  });

  describe('lazily registered states', () => {
    it('should not lose a transferred value when the state is added later', () => {
      // The value must stay alive after the InitState run, when the state is
      // not there yet. With `persist: false` there is no engine to hide a loss.
      const { store } = setup({
        states: [],
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'], persist: false },
        seed: { auth: { token: 'server-token' } }
      });

      // Act
      addFeatureStates([AuthState]);

      // Assert
      expect(store.snapshot().auth).toEqual({ token: 'server-token' });
    });

    it('should not lose it when an unrelated state is added first', () => {
      // Arrange
      const { store } = setup({
        states: [],
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'], persist: false },
        seed: { auth: { token: 'server-token' } }
      });

      // Act
      addFeatureStates([OtherState]);
      addFeatureStates([AuthState]);

      // Assert
      expect(store.snapshot().auth).toEqual({ token: 'server-token' });
    });

    it('should also work when the key is persisted', () => {
      // Arrange
      const { store, engine } = setup({
        states: [],
        plugin: { keys: ['auth'] },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } }
      });

      // Act
      addFeatureStates([AuthState]);

      // Assert
      expect(store.snapshot().auth).toEqual({ token: 'server-token' });
      expect(engine.getItem('auth')).toBe(JSON.stringify({ token: 'server-token' }));
    });
  });

  describe('migrations', () => {
    it('should not run a migration on a transferred value', () => {
      // Arrange
      const migrate = jest.fn((state: any) => ({ ...state, migrated: true }));
      const engine = new InMemoryEngine();
      const setItem = jest.spyOn(engine, 'setItem');

      // Act
      const { store } = setup({
        states: [AuthState, CounterState],
        plugin: {
          keys: ['auth', 'counter'],
          migrations: [{ version: 0, key: 'auth', migrate }]
        },
        transfer: { keys: ['auth'] },
        seed: { auth: { token: 'server-token' } },
        engine
      });

      // Assert
      expect(migrate).not.toHaveBeenCalled();
      expect(store.snapshot().auth).toEqual({ token: 'server-token' });
      // A migration would set `hasMigration` and write all keys again.
      expect(setItem).toHaveBeenCalledTimes(1);
    });

    it('should still run a migration on a value read from the engine', () => {
      // Arrange
      const migrate = jest.fn((state: any) => ({ ...state, migrated: true }));
      const engine = new InMemoryEngine();
      engine.setItem('auth', JSON.stringify({ token: 'stored-token' }));

      // Act
      const { store } = setup({
        plugin: { keys: ['auth'], migrations: [{ version: 0, key: 'auth', migrate }] },
        transfer: { keys: ['auth'] },
        engine
      });

      // Assert
      expect(migrate).toHaveBeenCalled();
      expect(store.snapshot().auth).toEqual({ token: 'stored-token', migrated: true });
    });
  });

  describe('dev mode validation', () => {
    it('should not log when the plugin uses keys "*"', () => {
      // Arrange
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Act
        setup({
          states: [AuthState],
          plugin: { keys: '*' },
          transfer: { keys: ['auth'] }
        });

        // Assert
        expect(consoleError).not.toHaveBeenCalled();
      } finally {
        consoleError.mockRestore();
      }
    });

    it('should log when a covered key is not persisted by the plugin', () => {
      // Arrange
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Act
        setup({
          states: [AuthState, CounterState],
          plugin: { keys: ['counter'] },
          transfer: { keys: ['auth'] }
        });

        // Assert
        expect(consoleError).toHaveBeenCalledWith(expect.stringMatching(/"auth"/));
      } finally {
        consoleError.mockRestore();
      }
    });

    it('should log when persist is false and the plugin uses keys "*"', () => {
      // Arrange
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Act
        setup({
          states: [AuthState],
          plugin: { keys: '*' },
          transfer: { keys: ['auth'], persist: false }
        });

        // Assert
        expect(consoleError).toHaveBeenCalledWith(expect.stringMatching(/persist/));
      } finally {
        consoleError.mockRestore();
      }
    });
  });

  describe('server to client round trip', () => {
    const NAMESPACED_KEY = 'gym:auth';
    const APP_ID_VALUE = 'ngxs-storage-test';

    @Component({ selector: 'app-root', template: '', standalone: true })
    class TestComponent {}

    // We dispatch in the constructor like a real app does after it sets the
    // token, for example a router navigation.
    @Component({ selector: 'app-root', template: '', standalone: true })
    class ServerTestComponent {
      private readonly store = inject(Store);

      constructor() {
        this.store.dispatch(new SetToken('server-token'));
        this.store.dispatch(new SetToken('server-token'));
      }
    }

    afterEach(() => {
      localStorage.removeItem(NAMESPACED_KEY);
    });

    function clientConfig(pluginOptions?: Partial<NgxsStoragePluginOptions>) {
      const appConfig: ApplicationConfig = {
        providers: [
          { provide: APP_ID, useValue: APP_ID_VALUE },
          provideStore(
            [AuthState],
            withNgxsStoragePlugin(
              { namespace: 'gym', keys: ['auth'], ...pluginOptions },
              withNgxsStorageTransferState({ keys: ['auth'] })
            )
          )
        ]
      };

      return appConfig;
    }

    /**
     * Renders on the "server" like a real request. `provideServerRendering`
     * puts the `<script id="{appId}-state">` tag into the HTML.
     *
     * `providers` is a function, because code that reads `ngServerMode` must
     * run after we set the flag, not when the caller makes the argument.
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
        throw new Error(
          `Could not find the "${appId}-state" transfer-state script in: ${html}`
        );
      }
      return match[1];
    }

    /**
     * Puts the transfer state script of the server into the real `document`,
     * so the own `TransferState` of the client can find it.
     */
    function prepareEnvironment(html: string): VoidFunction {
      const script = document.createElement('script');
      script.id = `${APP_ID_VALUE}-state`;
      script.setAttribute('type', 'application/json');
      script.textContent = extractTransferStateScript(html, APP_ID_VALUE);
      document.body.appendChild(script);

      return () => document.body.removeChild(script);
    }

    it(
      'should carry the server value into client state and into the engine',
      freshPlatform(async () => {
        // Arrange
        const { html, transferState } = await ssr(ServerTestComponent, () => [
          provideStore(
            [AuthState],
            withNgxsStoragePlugin(
              { namespace: 'gym', keys: ['auth'] },
              withNgxsStorageTransferState({ keys: ['auth'] })
            )
          )
        ]);

        // The server took the last value, not the value before it.
        expect(JSON.parse(transferState.toJson())).toEqual({
          [transferStateKey('auth', 'gym')]: { token: 'server-token' }
        });

        const cleanup = prepareEnvironment(html);

        try {
          // Act
          const { injector } = await skipConsoleLogging(() =>
            bootstrapApplication(TestComponent, clientConfig())
          );

          // Assert
          expect(injector.get(Store).snapshot()).toEqual({
            auth: { token: 'server-token' }
          });
          expect(localStorage.getItem(NAMESPACED_KEY)).toBe(
            JSON.stringify({ token: 'server-token' })
          );
        } finally {
          cleanup();
        }
      })
    );

    it(
      'should run beforeSerialize on the server write',
      freshPlatform(async () => {
        // Arrange
        const { transferState } = await ssr(ServerTestComponent, () => [
          provideStore(
            [AuthState],
            withNgxsStoragePlugin(
              {
                namespace: 'gym',
                keys: ['auth'],
                beforeSerialize: (value: any) => ({ ...value, tagged: true })
              },
              withNgxsStorageTransferState({ keys: ['auth'] })
            )
          )
        ]);

        // Assert
        expect(JSON.parse(transferState.toJson())).toEqual({
          [transferStateKey('auth', 'gym')]: { token: 'server-token', tagged: true }
        });
      })
    );

    it(
      'should not transfer a value when beforeSerialize returns undefined',
      freshPlatform(async () => {
        // Arrange
        const { html, transferState } = await ssr(ServerTestComponent, () => [
          provideStore(
            [AuthState],
            withNgxsStoragePlugin(
              { namespace: 'gym', keys: ['auth'], beforeSerialize: () => undefined },
              withNgxsStorageTransferState({ keys: ['auth'] })
            )
          )
        ]);

        // Assert: we wrote nothing to TransferState, so Angular put no script
        // tag in the HTML and the client has nothing to read.
        expect(JSON.parse(transferState.toJson())).toEqual({});
        expect(html).not.toContain(`${APP_ID_VALUE}-state`);

        // So the client takes the value from the engine.
        localStorage.setItem(NAMESPACED_KEY, JSON.stringify({ token: 'cached-token' }));

        const { injector } = await skipConsoleLogging(() =>
          bootstrapApplication(TestComponent, clientConfig())
        );

        expect(injector.get(Store).snapshot()).toEqual({
          auth: { token: 'cached-token' }
        });
      })
    );

    it(
      'should transfer null when beforeSerialize returns null',
      freshPlatform(async () => {
        // Arrange
        const { html, transferState } = await ssr(ServerTestComponent, () => [
          provideStore(
            [AuthState],
            withNgxsStoragePlugin(
              { namespace: 'gym', keys: ['auth'], beforeSerialize: () => null },
              withNgxsStorageTransferState({ keys: ['auth'] })
            )
          )
        ]);

        // Assert
        expect(JSON.parse(transferState.toJson())).toEqual({
          [transferStateKey('auth', 'gym')]: null
        });

        const cleanup = prepareEnvironment(html);

        try {
          const { injector } = await skipConsoleLogging(() =>
            bootstrapApplication(TestComponent, clientConfig())
          );

          expect(injector.get(Store).snapshot()).toEqual({ auth: null });
        } finally {
          cleanup();
        }
      })
    );
  });
});
