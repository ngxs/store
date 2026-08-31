import { assertInInjectionContext, inject, Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NgxsModule,
  withNgxsPlugin,
  Store,
  State,
  Action,
  StateContext,
  NgxsNextPluginFn,
  NgxsPlugin,
  InitState
} from '@ngxs/store';
import { debounceTime, firstValueFrom, tap } from 'rxjs';

describe('Plugins', () => {
  it('should run a function plugin (within an injection context too)', async () => {
    // Arrange
    const recorder: any[] = [];

    class Foo {
      static readonly type = 'Foo';
    }

    function asyncLogPlugin(state: any, action: any, next: NgxsNextPluginFn) {
      assertInInjectionContext(asyncLogPlugin);

      if (action.constructor.type === 'Foo') {
        recorder.push(['asyncLogPlugin()', action, 'before next()']);
      }

      return next(state, action).pipe(
        debounceTime(0),
        tap(() => {
          if (action.constructor.type === 'Foo') {
            recorder.push(['asyncLogPlugin()', action, 'after next()']);
          }
        })
      );
    }

    function otherPlugin(state: any, action: any, next: NgxsNextPluginFn) {
      assertInInjectionContext(otherPlugin);
      recorder.push(['otherPlugin()', action]);
      return next(state, action);
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()],
      providers: [withNgxsPlugin(asyncLogPlugin), withNgxsPlugin(otherPlugin)]
    });

    // Act
    const store = TestBed.inject(Store);

    // Assert
    expect(recorder).toEqual([['otherPlugin()', new InitState()]]);

    // Act
    const action = new Foo();
    await firstValueFrom(store.dispatch(action));

    // Assert
    expect(recorder).toEqual([
      ['otherPlugin()', new InitState()],
      ['asyncLogPlugin()', action, 'before next()'],
      ['otherPlugin()', action],
      ['asyncLogPlugin()', action, 'after next()']
    ]);
  });

  it('should run several plugins left to right, each advancing exactly one step', async () => {
    // Arrange
    const order: string[] = [];

    class Ping {
      static readonly type = 'Ping';
    }

    const makePlugin =
      (label: string) => (state: any, action: any, next: NgxsNextPluginFn) => {
        if (action.constructor.type === 'Ping') order.push(`enter:${label}`);
        return next(state, action).pipe(
          tap(() => {
            if (action.constructor.type === 'Ping') order.push(`exit:${label}`);
          })
        );
      };

    @State({ name: 'noop', defaults: 0 })
    @Injectable()
    class NoopState {}

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NoopState])],
      providers: [
        withNgxsPlugin(makePlugin('a')),
        withNgxsPlugin(makePlugin('b')),
        withNgxsPlugin(makePlugin('c'))
      ]
    });

    const store = TestBed.inject(Store);

    // Act
    await firstValueFrom(store.dispatch(new Ping()));

    // Assert — onion order: a → b → c in, c → b → a out.
    expect(order).toEqual(['enter:a', 'enter:b', 'enter:c', 'exit:c', 'exit:b', 'exit:a']);
  });

  it('should push state a plugin passes to next() into the store before the action runs', async () => {
    // Arrange
    class Rewrite {
      static readonly type = 'Rewrite';
    }

    function rewriteStatePlugin(state: any, action: any, next: NgxsNextPluginFn) {
      if (action.constructor.type === 'Rewrite') {
        // Hand the downstream a modified root state.
        return next({ ...state, counter: 999 }, action);
      }
      return next(state, action);
    }

    @State<number>({ name: 'counter', defaults: 0 })
    @Injectable()
    class CounterState {
      @Action(Rewrite)
      rewrite(ctx: StateContext<number>) {
        // Read-only handler: observe whatever the plugin pushed.
        ctx.setState(ctx.getState());
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])],
      providers: [withNgxsPlugin(rewriteStatePlugin)]
    });

    const store = TestBed.inject(Store);
    expect(store.snapshot().counter).toBe(0);

    // Act
    await firstValueFrom(store.dispatch(new Rewrite()));

    // Assert
    expect(store.snapshot().counter).toBe(999);
  });

  it('should dispatch with no plugins registered (fast path)', async () => {
    // Arrange
    class Increment {
      static readonly type = 'Increment';
    }

    @State<number>({ name: 'counter', defaults: 0 })
    @Injectable()
    class CounterState {
      @Action(Increment)
      increment(ctx: StateContext<number>) {
        ctx.setState(ctx.getState() + 1);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])]
    });

    const store = TestBed.inject(Store);
    const next = jest.fn();

    // Act
    store.dispatch(new Increment()).subscribe({ next });

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(store.snapshot().counter).toBe(1);
  });

  // An `@Action` handler body is not an injection context: `inject()` there (or
  // in an RxJS operator the handler builds during `.pipe()`) throws NG0203. Only
  // plugin *functions* get a context, and that is scoped to the function itself.
  async function runHandlerInjectionProbe(providers: any[]) {
    class Ping {
      static readonly type = 'Ping';
    }

    const probe: { threw: unknown } = { threw: null };

    @State({ name: 'noop', defaults: 0 })
    @Injectable()
    class NoopState {
      @Action(Ping)
      ping() {
        try {
          assertInInjectionContext(this.ping);
          inject(Injector);
        } catch (error) {
          probe.threw = error;
        }
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NoopState])],
      providers
    });

    const store = TestBed.inject(Store);
    await firstValueFrom(store.dispatch(new Ping()));
    return probe;
  }

  it('should not run an action handler in an injection context with no plugins registered', async () => {
    const { threw } = await runHandlerInjectionProbe([]);

    expect((threw as Error)?.message).toContain('NG0203');
  });

  it('should not run an action handler in an injection context with a class plugin registered', async () => {
    @Injectable()
    class PassThroughPlugin implements NgxsPlugin {
      handle(state: any, action: any, next: NgxsNextPluginFn) {
        return next(state, action);
      }
    }

    const { threw } = await runHandlerInjectionProbe([withNgxsPlugin(PassThroughPlugin)]);

    expect((threw as Error)?.message).toContain('NG0203');
  });

  it('should run a functional plugin in an injection context', async () => {
    let pluginInjector: Injector | null = null;

    const injectingPlugin = (state: any, action: any, next: NgxsNextPluginFn) => {
      pluginInjector = inject(Injector);
      return next(state, action);
    };

    class Ping {
      static readonly type = 'Ping';
    }

    @State({ name: 'noop', defaults: 0 })
    @Injectable()
    class NoopState {
      @Action(Ping)
      ping() {}
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NoopState])],
      providers: [withNgxsPlugin(injectingPlugin)]
    });

    const store = TestBed.inject(Store);
    await firstValueFrom(store.dispatch(new Ping()));

    expect(pluginInjector).toBe(TestBed.inject(Injector));
  });

  // Known limitation: a functional plugin's injection context is scoped to the
  // plugin function, but because plugins call `next()` synchronously the rest of
  // the chain - including the action handler - runs inside that frame. So a
  // functional plugin that forwards `next()` still leaks its context to the
  // handler. Class plugins and the no-plugin path do not (see above).
  it('leaks a forwarding functional plugin context into the action handler', async () => {
    const passThroughPlugin = (state: any, action: any, next: NgxsNextPluginFn) =>
      next(state, action);

    const { threw } = await runHandlerInjectionProbe([withNgxsPlugin(passThroughPlugin)]);

    expect(threw).toBeNull();
  });
});
