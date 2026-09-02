import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Action,
  Actions,
  NgxsNextPluginFn,
  NgxsPlugin,
  ofActionDispatched,
  provideStore,
  State,
  StateContext,
  Store,
  dispatch,
  withNgxsPlugin
} from '@ngxs/store';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  mergeMap,
  take,
  tap,
  throwError,
  timer
} from 'rxjs';

// A plugin doesn't have to call `next()` straight away - it can call it from
// inside an operator. The lazy-loaded-state plugins do this: they hold the
// action back on a gate until the state module has been imported, then
// `mergeMap(() => next(state, action))`. Once the gate has resolved it re-emits
// on every subscription, so `next()` - and the dispatch it drives - runs once
// per *subscription* of what the plugin returned, not once per dispatch.
//
// NGXS subscribes each dispatch stream more than once internally: `dispatch()`
// runs the chain eagerly even if you never subscribe, then hands you the same
// stream. So the stream has to be shared such that those extra subscriptions
// replay the finished result instead of re-running the action. These tests pin
// that - without the fix the action dispatches twice (or more).
describe('plugin that calls next() lazily', () => {
  class Increment {
    static readonly type = 'Increment';
  }

  class Fail {
    static readonly type = 'Fail';
  }

  class Slow {
    static readonly type = 'Slow';
  }

  // Each handler run pushes its name here, so a re-dispatch shows up as a
  // duplicate entry.
  let handlerRuns: string[];

  // Stands in for "the lazy state module". `setup()` flips it to `true` before
  // dispatching, so by then it's an already-resolved gate that replays `true`
  // to every new subscriber - the shape that used to double-dispatch.
  let stateReady$: BehaviorSubject<boolean>;

  @State<number>({ name: 'counter', defaults: 0 })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment(ctx: StateContext<number>) {
      handlerRuns.push('Increment');
      // Async on purpose: the dispatch has to still be pending when NGXS swaps
      // its eager subscriber for the caller's - that's the window the bug hit.
      return timer(1).pipe(tap(() => ctx.setState(ctx.getState() + 1)));
    }

    @Action(Fail)
    fail() {
      handlerRuns.push('Fail');
      return timer(1).pipe(mergeMap(() => throwError(() => new Error('boom'))));
    }

    @Action(Slow, { cancelUncompleted: true })
    slow(ctx: StateContext<number>) {
      handlerRuns.push('Slow');
      return timer(20).pipe(tap(() => ctx.setState(ctx.getState() + 100)));
    }
  }

  // A cut-down `NgxsWithLazyStatePlugin`: hold the action on `stateReady$` until
  // the state is loaded, then `mergeMap(() => next(...))`. `filter(Boolean)` +
  // `take(1)` is what lets the dispatch complete. `mergeMap` re-invokes `next()`
  // on every subscription, which is the whole point of these tests.
  @Injectable()
  class LazyNextPlugin implements NgxsPlugin {
    handle(state: any, action: any, next: NgxsNextPluginFn) {
      return stateReady$.pipe(
        filter(Boolean),
        take(1),
        mergeMap(() => next(state, action))
      );
    }
  }

  function setup() {
    handlerRuns = [];
    stateReady$ = new BehaviorSubject<boolean>(false);
    stateReady$.next(true); // pretend the lazy state module has finished loading
    TestBed.configureTestingModule({
      providers: [provideStore([CounterState], withNgxsPlugin(LazyNextPlugin))]
    });
    return {
      store: TestBed.inject(Store),
      actions$: TestBed.inject(Actions)
    };
  }

  // Handlers are async, so give them a macrotask to land.
  const settle = () => new Promise(resolve => setTimeout(resolve, 50));

  it('runs the handler once when the caller subscribes', async () => {
    const { store } = setup();
    let emissions = 0;

    store.dispatch(new Increment()).subscribe(() => emissions++);
    await settle();

    expect(handlerRuns).toEqual(['Increment']);
    expect(store.snapshot().counter).toBe(1);
    expect(emissions).toBe(1);
  });

  it('runs the handler once when nobody subscribes', async () => {
    const { store } = setup();

    store.dispatch(new Increment()); // fire and forget
    await settle();

    expect(handlerRuns).toEqual(['Increment']);
    expect(store.snapshot().counter).toBe(1);
  });

  it('runs the handler once when the result is both subscribed and awaited', async () => {
    setup();
    const store = TestBed.inject(Store);
    const increment = TestBed.runInInjectionContext(() => dispatch(Increment));

    const result = increment();
    let emissions = 0;
    result.subscribe(() => emissions++);
    await result; // `.then()` subscribes the same result a second time

    expect(handlerRuns).toEqual(['Increment']);
    expect(store.snapshot().counter).toBe(1);
    expect(emissions).toBe(1);
  });

  it('puts the action on the Actions stream once', async () => {
    const { store, actions$ } = setup();
    const dispatched: unknown[] = [];
    actions$.pipe(ofActionDispatched(Increment)).subscribe(action => dispatched.push(action));

    store.dispatch(new Increment()).subscribe();
    await settle();

    expect(dispatched.length).toBe(1);
  });

  it('replays the finished result to a late subscriber instead of re-running', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new Increment());
    await settle(); // let it finish

    let emissions = 0;
    result$.subscribe(() => emissions++);

    expect(emissions).toBe(1); // got the replayed value
    expect(handlerRuns).toEqual(['Increment']); // did not run again
  });

  it('replays an error to a late subscriber instead of re-running', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new Fail());
    await expect(firstValueFrom(result$)).rejects.toThrow('boom');

    // Subscribing again gets the same error back, not a fresh dispatch.
    await expect(firstValueFrom(result$)).rejects.toThrow('boom');
    expect(handlerRuns).toEqual(['Fail']);
  });

  it('completes a canceled action without a value and without re-running it', async () => {
    const { store } = setup();
    let emissions = 0;
    let completed = false;

    store.dispatch(new Slow()).subscribe({
      next: () => emissions++,
      complete: () => (completed = true)
    });
    store.dispatch(new Slow()); // cancels the first one (`cancelUncompleted`)
    await settle();

    expect(completed).toBe(true);
    expect(emissions).toBe(0);
    expect(handlerRuns).toEqual(['Slow', 'Slow']);
    expect(store.snapshot().counter).toBe(100); // only the winner wrote
  });

  it('runs each handler once for a multi-action dispatch', async () => {
    const { store } = setup();
    let emissions = 0;

    store.dispatch([new Increment(), new Increment()]).subscribe(() => emissions++);
    await settle();

    expect(handlerRuns).toEqual(['Increment', 'Increment']);
    expect(store.snapshot().counter).toBe(2);
    expect(emissions).toBe(1); // `forkJoin` -> one emission for the whole batch
  });
});
