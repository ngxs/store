import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { State, Action, Store, provideStore, StateContext } from '@ngxs/store';

import { createPromiseTestHelper } from '../helpers/promise-test-helper';

describe('Canceling promises (preventing state writes)', () => {
  const recorder: string[] = [];

  class IncrementWithAwait {
    static readonly type = 'Increment with await';
  }

  class IncrementWithThen {
    static readonly type = 'Increment with then';
  }

  class IncrementWithFireAndForget {
    static readonly type = 'Increment with fire and forget';
  }

  const { promise: promiseAwaitReady, markPromiseResolved: markPromiseAwaitReady } =
    createPromiseTestHelper();

  const { promise: promiseThenReady, markPromiseResolved: markPromiseThenReady } =
    createPromiseTestHelper();

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Action(IncrementWithAwait, { cancelUncompleted: true })
    async incrementWithAwait(ctx: StateContext<number>) {
      recorder.push('before promise await ready');
      await promiseAwaitReady;
      recorder.push('after promise await ready');
      ctx.setState(value => value + 1);
      recorder.push(`value: ${ctx.getState()}`);
    }

    @Action(IncrementWithThen, { cancelUncompleted: true })
    incrementWithThen(ctx: StateContext<number>) {
      recorder.push('before promise then ready');
      return promiseThenReady.then(() => {
        recorder.push('after promise then ready');
        ctx.setState(value => value + 1);
        recorder.push(`value: ${ctx.getState()}`);
      });
    }

    @Action(IncrementWithFireAndForget, { cancelUncompleted: true })
    incrementWithFireAndForget(ctx: StateContext<number>) {
      recorder.push('before promise then ready');
      promiseThenReady.then(() => {
        recorder.push('after promise then ready');
        ctx.setState(value => value + 1);
        recorder.push(`value: ${ctx.getState()}`);
      });
    }
  }

  beforeEach(() => {
    recorder.length = 0;

    TestBed.configureTestingModule({
      providers: [provideStore([CounterState])]
    });
  });

  it('canceling promises using `await`', async () => {
    // Arrange
    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new IncrementWithAwait());

    // Assert
    expect(recorder).toEqual(['before promise await ready']);

    // Act (dispatch another action to cancel the previous one)
    // The promise is not resolved yet, as thus `await` is not executed.
    store.dispatch(new IncrementWithAwait());

    // Assert
    expect(recorder).toEqual(['before promise await ready', 'before promise await ready']);

    // Act
    markPromiseAwaitReady();
    await promiseAwaitReady;

    // Assert
    expect(store.snapshot()).toEqual({ counter: 1 });
    expect(recorder).toEqual([
      'before promise await ready',
      'before promise await ready',
      // Note that once the promise is resolved, the await has been executed,
      // and both microtasks have also been executed (`recorder.push(...)` is a
      // microtask because it is created by `await`).
      'after promise await ready',
      // Value has not been updated in the state.
      'value: 0',
      'after promise await ready',
      'value: 1'
    ]);
  });

  it('canceling promises using `then(...)`', async () => {
    // Arrange
    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new IncrementWithThen());

    // Assert
    expect(recorder).toEqual(['before promise then ready']);

    // Act (dispatch another action to cancel the previous one)
    // The promise is not resolved yet, as thus `then(...)` is not executed.
    store.dispatch(new IncrementWithThen());

    // Assert
    expect(recorder).toEqual(['before promise then ready', 'before promise then ready']);

    // Act
    markPromiseThenReady();
    await promiseThenReady;

    // Assert
    expect(store.snapshot()).toEqual({ counter: 1 });
    expect(recorder).toEqual([
      'before promise then ready',
      'before promise then ready',
      'after promise then ready',
      // Value has not been updated in the state.
      'value: 0',
      'after promise then ready',
      'value: 1'
    ]);
  });

  it('should allow state writes when the action is written in "fire & forget" style', async () => {
    // Arrange
    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new IncrementWithFireAndForget());

    // Assert
    expect(recorder).toEqual(['before promise then ready']);

    // Act
    store.dispatch(new IncrementWithFireAndForget());

    // Assert
    expect(recorder).toEqual(['before promise then ready', 'before promise then ready']);

    // Act
    markPromiseThenReady();
    await promiseThenReady;

    // Assert
    expect(store.snapshot()).toEqual({ counter: 2 });
    expect(recorder).toEqual([
      'before promise then ready',
      'before promise then ready',
      'after promise then ready',
      'value: 1',
      'after promise then ready',
      'value: 2'
    ]);
  });
});
