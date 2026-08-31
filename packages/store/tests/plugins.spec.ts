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

  // Whether an `@Action` handler runs inside an injection context must not
  // depend on how many plugins happen to be registered. The no-plugin dispatch
  // fast path takes a different code route than the plugin chain; this pins the
  // two to the same behavior so a handler that calls `inject()` (directly, or
  // from an RxJS operator it builds during `.pipe()`) doesn't silently break in
  // a plugin-less setup such as a bare `NgxsModule.forRoot([...])` test.
  async function runInjectionContextProbe(plugins: any[]) {
    class Ping {
      static readonly type = 'Ping';
    }

    const probe: { threw: unknown; injector: Injector | null } = {
      threw: null,
      injector: null
    };

    @State({ name: 'noop', defaults: 0 })
    @Injectable()
    class NoopState {
      @Action(Ping)
      ping() {
        try {
          assertInInjectionContext(this.ping);
          probe.injector = inject(Injector);
        } catch (error) {
          probe.threw = error;
        }
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NoopState])],
      providers: plugins.map(withNgxsPlugin)
    });

    const store = TestBed.inject(Store);
    await firstValueFrom(store.dispatch(new Ping()));
    return { ...probe, testBedInjector: TestBed.inject(Injector) };
  }

  it('should run an action handler in an injection context with no plugins registered (fast path)', async () => {
    const { threw, injector, testBedInjector } = await runInjectionContextProbe([]);

    expect(threw).toBeNull();
    expect(injector).toBe(testBedInjector);
  });

  it('should run an action handler in an injection context the same way with a plugin registered', async () => {
    const passThroughPlugin = (state: any, action: any, next: NgxsNextPluginFn) =>
      next(state, action);

    const { threw, injector, testBedInjector } = await runInjectionContextProbe([
      passThroughPlugin
    ]);

    expect(threw).toBeNull();
    expect(injector).toBe(testBedInjector);
  });
});
