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
  Observable,
  ReplaySubject,
  Subject,
  firstValueFrom,
  mergeMap,
  take,
  tap,
  throwError,
  timer
} from 'rxjs';

// A plugin is allowed to call `next()` from inside an operator callback, which
// means `next()` runs once per subscription of the observable it returns rather
// than once per dispatch. The dispatch stream therefore has to be subscribed
// exactly once - `fallbackSubscriber` swaps its eager subscription for the
// caller's, and that swap used to reset the multicast and re-run the chain.
describe('plugin that defers next()', () => {
  class Increment {
    static readonly type = '[Counter] Increment';
  }

  class Decrement {
    static readonly type = '[Counter] Decrement';
  }

  class Fail {
    static readonly type = '[Counter] Fail';
  }

  class Slow {
    static readonly type = '[Counter] Slow';
  }

  // Already open, and it replays, so `next()` is reachable on every
  // subscription. This is the real-world shape: a plugin that waits on lazy
  // state registration, dispatched after that registration finished.
  let gate$: ReplaySubject<void>;
  // Fires once and never again - a plugin waiting on something still pending.
  let oneShotGate$: Subject<void>;

  let handlerCalls: string[];
  let pluginCalls: string[];
  let nextCalls: string[];

  @State<number>({ name: 'counter', defaults: 0 })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment(ctx: StateContext<number>) {
      handlerCalls.push('increment');
      // Async on purpose: the dispatch stream has to stay pending across the
      // eager-to-real subscriber swap for the regression to be reachable.
      return timer(5).pipe(tap(() => ctx.setState(ctx.getState() + 1)));
    }

    @Action(Decrement)
    decrement(ctx: StateContext<number>) {
      handlerCalls.push('decrement');
      return timer(5).pipe(tap(() => ctx.setState(ctx.getState() - 1)));
    }

    @Action(Fail)
    fail() {
      handlerCalls.push('fail');
      return timer(5).pipe(mergeMap(() => throwError(() => new Error('boom'))));
    }

    @Action(Slow, { cancelUncompleted: true })
    slow(ctx: StateContext<number>) {
      handlerCalls.push('slow');
      return timer(20).pipe(tap(() => ctx.setState(ctx.getState() + 100)));
    }
  }

  function makeDeferringPlugin(getGate: () => Observable<void>) {
    @Injectable()
    class DeferringPlugin implements NgxsPlugin {
      handle(state: any, action: any, next: NgxsNextPluginFn) {
        const type: string = action.constructor.type;

        // Let bootstrap actions (`@@INIT` and friends) through eagerly,
        // otherwise the store never initializes.
        if (!type.startsWith('[Counter]')) {
          return next(state, action);
        }

        pluginCalls.push(type);

        return getGate().pipe(
          take(1),
          mergeMap(() => {
            nextCalls.push(type);
            return next(state, action);
          })
        );
      }
    }

    return DeferringPlugin;
  }

  const ReplayGatePlugin = makeDeferringPlugin(() => gate$);
  const OneShotGatePlugin = makeDeferringPlugin(() => oneShotGate$);

  function setup(plugin: any = ReplayGatePlugin) {
    gate$ = new ReplaySubject<void>(1);
    gate$.next();
    oneShotGate$ = new Subject<void>();
    handlerCalls = [];
    pluginCalls = [];
    nextCalls = [];

    TestBed.configureTestingModule({
      providers: [provideStore([CounterState], withNgxsPlugin(plugin))]
    });

    return {
      store: TestBed.inject(Store),
      actions$: TestBed.inject(Actions)
    };
  }

  // Handlers are async, so give them a macrotask to land.
  const settle = () => new Promise(resolve => setTimeout(resolve, 50));

  // Everything one dispatch subscriber saw. A double dispatch shows up here as a
  // second emission, so tests assert on this as well as on the handler counters.
  function record<T>(source: Observable<T>) {
    const log = { emissions: [] as T[], errors: [] as unknown[], completed: false };
    source.subscribe({
      next: value => log.emissions.push(value),
      error: error => log.errors.push(error),
      complete: () => (log.completed = true)
    });
    return log;
  }

  it('should run the handler once when the caller subscribes', async () => {
    const { store } = setup();

    const caller = record(store.dispatch(new Increment()));

    await settle();

    // Assert on the handler and the state as well as on the emissions - the
    // downstream `share` can hide a second run from the caller.
    expect(handlerCalls).toEqual(['increment']);
    expect(store.snapshot().counter).toBe(1);
    expect(caller.emissions.length).toBe(1);
    expect(caller.completed).toBe(true);
    expect(caller.errors).toEqual([]);
  });

  it('should put the action on the actions stream once', async () => {
    const { store, actions$ } = setup();
    const dispatched: unknown[] = [];

    actions$.pipe(ofActionDispatched(Increment)).subscribe(action => dispatched.push(action));

    const caller = record(store.dispatch(new Increment()));

    await settle();

    expect(dispatched.length).toBe(1);
    expect(caller.emissions.length).toBe(1);
    expect(caller.completed).toBe(true);
  });

  it('should run the handler once when nobody subscribes', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new Increment());

    await settle();

    // Pins the `fallbackSubscriber` eager path: no subscriber must still mean
    // exactly one dispatch, not zero.
    expect(handlerCalls).toEqual(['increment']);
    expect(store.snapshot().counter).toBe(1);

    // A subscriber turning up afterwards gets the replay, not a re-run.
    const late = record(result$);
    expect(late.emissions.length).toBe(1);
    expect(late.completed).toBe(true);
    expect(handlerCalls).toEqual(['increment']);
  });

  it('should run the handler once when the same result is both subscribed and awaited', async () => {
    setup();
    const incrementFn = TestBed.runInInjectionContext(() => dispatch(Increment));
    const store = TestBed.inject(Store);

    // `AsyncReturnType.then()` subscribes the dispatch result a second time.
    const result = incrementFn();
    const caller = record(result);
    await result;

    expect(handlerCalls).toEqual(['increment']);
    expect(store.snapshot().counter).toBe(1);
    expect(caller.emissions.length).toBe(1);
    expect(caller.completed).toBe(true);
  });

  it('should enter the plugin and call next() once per dispatch', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new Increment());
    const first = record(result$);
    const second = record(result$);

    await settle();

    // The plugin body runs when the chain is built; `next()` runs per
    // subscription of what the plugin returned - that one is the direct probe.
    expect(pluginCalls).toEqual(['[Counter] Increment']);
    expect(nextCalls).toEqual(['[Counter] Increment']);
    // Two subscribers, one run: one emission apiece, not two.
    expect(first.emissions.length).toBe(1);
    expect(second.emissions.length).toBe(1);
    expect(first.completed && second.completed).toBe(true);
  });

  it('should not re-dispatch when a subscriber attaches after the error', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new Fail());

    await expect(firstValueFrom(result$)).rejects.toThrow('boom');

    // A multicast that resets on error re-subscribes the chain, and this gate
    // replays, so `next()` would be reached a second time.
    await expect(firstValueFrom(result$)).rejects.toThrow('boom');
    expect(handlerCalls).toEqual(['fail']);
    expect(nextCalls).toEqual(['[Counter] Fail']);

    // The replay is the error itself - no value slips out alongside it.
    const late = record(result$);
    expect(late.errors.length).toBe(1);
    expect(late.emissions).toEqual([]);
    expect(handlerCalls).toEqual(['fail']);
  });

  it('should replay an error to a late subscriber instead of stalling', async () => {
    const { store } = setup(OneShotGatePlugin);

    const result$ = store.dispatch(new Fail());
    const first = firstValueFrom(result$);
    oneShotGate$.next();

    await expect(first).rejects.toThrow('boom');

    // This gate never emits again, so a multicast that resets on error hands
    // the second subscriber a source that goes quiet - it would hang instead of
    // seeing the error.
    await expect(firstValueFrom(result$)).rejects.toThrow('boom');
    expect(handlerCalls).toEqual(['fail']);
  });

  it('should complete a canceled action without emitting and without re-running it', async () => {
    const { store } = setup();

    const canceled = record(store.dispatch(new Slow()));
    // Second dispatch cancels the first (`cancelUncompleted`).
    const winner = record(store.dispatch(new Slow()));

    await settle();

    expect(canceled.completed).toBe(true);
    expect(canceled.emissions).toEqual([]);
    expect(canceled.errors).toEqual([]);
    expect(winner.emissions.length).toBe(1);
    expect(winner.completed).toBe(true);
    expect(handlerCalls).toEqual(['slow', 'slow']);
    // Only the second run got to write.
    expect(store.snapshot().counter).toBe(100);
  });

  it('should run each handler once for a multi-action dispatch', async () => {
    const { store } = setup();

    const caller = record(store.dispatch([new Increment(), new Decrement()]));

    await settle();

    expect(handlerCalls).toEqual(['increment', 'decrement']);
    expect(store.snapshot().counter).toBe(0);
    // `forkJoin` + `map(() => undefined)`: one emission for the whole batch.
    expect(caller.emissions).toEqual([undefined]);
    expect(caller.completed).toBe(true);
  });
});
