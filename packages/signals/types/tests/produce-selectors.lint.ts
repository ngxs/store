/// <reference types="@types/jest" />

import { Selector, State, StateToken, createSelector } from '@ngxs/store';

import { produceSelectors } from '../../';

describe('[TEST]: produceSelectors', () => {
  interface CounterStateModel {
    counter: number;
  }

  const COUNTER_STATE_TOKEN = new StateToken<CounterStateModel>('counter');

  @State<CounterStateModel>({
    name: COUNTER_STATE_TOKEN,
    defaults: {
      counter: 0
    }
  })
  class CounterState {
    @Selector()
    static getCounter(state: CounterStateModel) {
      return state;
    }
  }

  it('should error on invalid use cases', () => {
    produceSelectors(); // $ExpectError
    produceSelectors({}); // $ExpectError
    produceSelectors({ counter: CounterState }); // $ExpectError
  });

  it('should infer correct return types', () => {
    produceSelectors({ counter: CounterState.getCounter }); // $ExpectType { counter: Signal<CounterStateModel>; }
    produceSelectors({ counter: COUNTER_STATE_TOKEN }); // $ExpectType { counter: Signal<CounterStateModel>; }

    const dynamicSelector_withStateClass = createSelector([CounterState], state => state.counter);
    const dynamicSelector_withSelector = createSelector([CounterState.getCounter], state => state.counter);
    const dynamicSelector_withStateToken = createSelector([COUNTER_STATE_TOKEN], state => state.counter);

    produceSelectors({ counter: dynamicSelector_withStateClass }); // $ExpectType { counter: Signal<any>; }
    produceSelectors({ counter: dynamicSelector_withSelector }); // $ExpectType { counter: Signal<number>; }
    produceSelectors({ counter: dynamicSelector_withStateToken }); // $ExpectType { counter: Signal<number>; }
  });
});
