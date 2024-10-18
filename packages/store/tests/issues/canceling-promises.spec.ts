import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { State, Action, Store, provideStore } from '@ngxs/store';

import { createPromiseTestHelper } from '../helpers/promise-test-helper';

// This test essentially shows that microtasks are not cancelable in JavaScript.
// Therefore, using actions that return promises cannot be used with the
// `cancelUncompleted` option, as this will result in the functionality being
// executed twice (once by the executing action and again by the newly dispatched
// action). Any third-party code that returns promises is also not cancelable.
describe('Canceling promises', () => {
  const recorder: string[] = [];

  class MyActionAwait {
    static readonly type = '[MyState] My action await';
  }

  class MyActionThen {
    static readonly type = '[MyState] My action then';
  }

  const { promise: promiseAwaitReady, markPromiseResolved: markPromiseAwaitReady } =
    createPromiseTestHelper();

  const { promise: promiseThenReady, markPromiseResolved: markPromiseThenReady } =
    createPromiseTestHelper();

  @State<string>({
    name: 'myState',
    defaults: 'STATE_VALUE'
  })
  @Injectable()
  class MyState {
    @Action(MyActionAwait, { cancelUncompleted: true })
    async handleActionAwait() {
      recorder.push('before promise await ready');
      await promiseAwaitReady;
      recorder.push('after promise await ready');
    }

    @Action(MyActionThen, { cancelUncompleted: true })
    handleActionThen() {
      recorder.push('before promise then ready');
      return promiseThenReady.then(() => {
        recorder.push('after promise then ready');
      });
    }
  }

  beforeEach(() => {
    recorder.length = 0;

    TestBed.configureTestingModule({
      providers: [provideStore([MyState])]
    });
  });

  it('canceling promises using `await`', async () => {
    // Arrange
    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new MyActionAwait());

    // Assert
    expect(recorder).toEqual(['before promise await ready']);

    // Act (dispatch another action to cancel the previous one)
    // The promise is not resolved yet, as thus `await` is not executed.
    store.dispatch(new MyActionAwait());

    // Assert
    expect(recorder).toEqual(['before promise await ready', 'before promise await ready']);

    // Act
    markPromiseAwaitReady();
    await promiseAwaitReady;

    // Assert
    expect(recorder).toEqual([
      'before promise await ready',
      'before promise await ready',
      // Note that once the promise is resolved, the await has been executed,
      // and both microtasks have also been executed (`recorder.push(...)` is a
      // microtask because it is created by `await`).
      'after promise await ready',
      'after promise await ready'
    ]);
  });

  it('canceling promises using `then(...)`', async () => {
    // Arrange
    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new MyActionThen());

    // Assert
    expect(recorder).toEqual(['before promise then ready']);

    // Act (dispatch another action to cancel the previous one)
    // The promise is not resolved yet, as thus `then(...)` is not executed.
    store.dispatch(new MyActionThen());

    // Assert
    expect(recorder).toEqual(['before promise then ready', 'before promise then ready']);

    // Act
    markPromiseThenReady();
    await promiseThenReady;

    // Assert
    expect(recorder).toEqual([
      'before promise then ready',
      'before promise then ready',
      'after promise then ready',
      'after promise then ready'
    ]);
  });
});
