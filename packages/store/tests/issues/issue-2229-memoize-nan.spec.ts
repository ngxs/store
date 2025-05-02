import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Action,
  createPropertySelectors,
  createSelector,
  DispatchOutsideZoneNgxsExecutionStrategy,
  provideStore,
  State,
  StateContext,
  Store
} from '@ngxs/store';

describe('Selector returns NaN (https://github.com/ngxs/store/issues/2229)', () => {
  interface CounterStateModel {
    countA: number;
  }

  class AddToA {
    static readonly type = 'Add to A';
    constructor(readonly amount: number) {}
  }

  @State<CounterStateModel>({
    name: 'count',
    defaults: {
      countA: 0
    }
  })
  @Injectable()
  class CounterState {
    @Action(AddToA)
    addToA(ctx: StateContext<CounterStateModel>, action: AddToA) {
      const state = ctx.getState();
      ctx.patchState({ countA: state.countA + action.amount });
    }
  }

  const recalculations = {
    selectorReturningNaN: 0,
    selectorDependingOnNaN: 0
  };

  const { countA } = createPropertySelectors<CounterStateModel>(CounterState);

  const selectorReturningNaN = createSelector([countA], () => {
    recalculations.selectorReturningNaN++;
    return Number.NaN;
  });

  const selectorDependingOnNaN = createSelector([selectorReturningNaN], () => {
    recalculations.selectorDependingOnNaN++;
    return 'Hello world';
  });

  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore([CounterState], {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        })
      ]
    });

    return TestBed.inject(Store);
  };

  it('should not recalculate selector which depends on the selector returning NaN', () => {
    // Arrange
    const store = testSetup();

    // Assert
    expect(recalculations).toEqual({
      selectorReturningNaN: 0,
      selectorDependingOnNaN: 0
    });

    // Act
    store.select(selectorReturningNaN).subscribe();
    store.select(selectorDependingOnNaN).subscribe();

    // Assert
    expect(recalculations).toEqual({
      selectorReturningNaN: 1,
      selectorDependingOnNaN: 1
    });

    // Act
    store.dispatch(new AddToA(1));
    store.dispatch(new AddToA(1));

    expect(recalculations).toEqual({
      selectorReturningNaN: 3,
      selectorDependingOnNaN: 1
    });
  });
});
