import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { State, Action, Store, provideStore, StateContext } from '@ngxs/store';

describe('Writing to state after action handler has been unsubscribed', () => {
  class Increment {
    static readonly type = '[Counter] Increment';
  }

  @State({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Action(Increment, { cancelUncompleted: true })
    async handleActionAwait(ctx: StateContext<number>) {
      await Promise.resolve();
      ctx.setState(counter => counter + 1);
    }
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [provideStore([CounterState])]
    });

    return TestBed.inject(Store);
  };

  it('should not write to state if the action has been canceled', async () => {
    // Arrange
    const store = testSetup();

    // Act
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    await Promise.resolve();

    // Assert
    expect(store.snapshot()).toEqual({ counter: 1 });
  });
});
