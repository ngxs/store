import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Action,
  Actions,
  NgxsModule,
  ofActionErrored,
  ofActionSuccessful,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { firstValueFrom, tap, throwError, timer } from 'rxjs';

describe('dispatch result pipeline', () => {
  class Succeed {
    static readonly type = 'Succeed';
  }

  class SucceedAsync {
    static readonly type = 'SucceedAsync';
  }

  class Fail {
    static readonly type = 'Fail';
  }

  @State<number>({ name: 'counter', defaults: 0 })
  @Injectable()
  class CounterState {
    @Action(Succeed)
    succeed(ctx: StateContext<number>) {
      ctx.setState(ctx.getState() + 1);
    }

    @Action(SucceedAsync)
    succeedAsync(ctx: StateContext<number>) {
      return timer(1).pipe(tap(() => ctx.setState(ctx.getState() + 1)));
    }

    @Action(Fail)
    fail() {
      return throwError(() => new Error('boom'));
    }
  }

  function setup() {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])]
    });
    return {
      store: TestBed.inject(Store),
      actions$: TestBed.inject(Actions)
    };
  }

  it('replays the result to a subscriber that arrives after the action finished', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new Succeed());
    await firstValueFrom(result$);
    expect(store.selectSnapshot(CounterState)).toBe(1);

    // Subscribing to the same observable again still resolves - a single
    // dispatch replays the post-action state.
    const late = await firstValueFrom(result$);
    expect(late).toEqual({ counter: 1 });
  });

  it('replays the error to a late subscriber instead of hanging', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new Fail());

    await expect(firstValueFrom(result$)).rejects.toThrow('boom');
    await expect(firstValueFrom(result$)).rejects.toThrow('boom');
  });

  it('delivers the value to every subscriber attached before an async action resolves', async () => {
    const { store } = setup();

    const result$ = store.dispatch(new SucceedAsync());
    const first = firstValueFrom(result$);
    const second = firstValueFrom(result$);
    const third = firstValueFrom(result$);

    expect(await first).toEqual({ counter: 1 });
    expect(await second).toEqual({ counter: 1 });
    expect(await third).toEqual({ counter: 1 });
  });

  it('runs the handler once no matter how many times you subscribe', () => {
    const { store } = setup();

    const result$ = store.dispatch(new Succeed());
    result$.subscribe();
    result$.subscribe();
    result$.subscribe();

    // `Succeed` bumps the counter once - re-subscribing just replays.
    expect(store.selectSnapshot(CounterState)).toBe(1);
  });

  it('still pushes the result status onto the Actions stream', async () => {
    const { store, actions$ } = setup();

    const succeeded = firstValueFrom(actions$.pipe(ofActionSuccessful(Succeed)));
    store.dispatch(new Succeed());
    await expect(succeeded).resolves.toBeInstanceOf(Succeed);

    // `ofActionErrored` emits a wrapper, not the raw action.
    const errored = firstValueFrom(actions$.pipe(ofActionErrored(Fail)));
    store.dispatch(new Fail());
    const completion = await errored;
    expect(completion.action).toBeInstanceOf(Fail);
    expect(completion.result.error).toEqual(new Error('boom'));
  });

  it('runs the handler even when nobody subscribes to the returned observable', () => {
    const { store } = setup();

    store.dispatch(new Succeed());

    expect(store.selectSnapshot(CounterState)).toBe(1);
  });
});
