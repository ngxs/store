/// <reference types="@types/jest" />

import { Selector, State, StateToken, createSelector } from '@ngxs/store';

import { createSelectMap } from '../../';

describe('[TEST]: createSelectMap', () => {
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
    createSelectMap(); // $ExpectError
    createSelectMap({}); // $ExpectError
    createSelectMap({ counter: CounterState }); // $ExpectError
  });

  it('should infer correct return types', () => {
    createSelectMap({ counter: CounterState.getCounter }); // $ExpectType { readonly counter: Signal<CounterStateModel>; }
    createSelectMap({ counter: COUNTER_STATE_TOKEN }); // $ExpectType { readonly counter: Signal<CounterStateModel>; }

    const dynamicSelector_withStateClass = createSelector([CounterState], state => state.counter);
    const dynamicSelector_withSelector = createSelector([CounterState.getCounter], state => state.counter);
    const dynamicSelector_withStateToken = createSelector([COUNTER_STATE_TOKEN], state => state.counter);

    createSelectMap({ counter: dynamicSelector_withStateClass }); // $ExpectType { readonly counter: Signal<any>; }
    createSelectMap({ counter: dynamicSelector_withSelector }); // $ExpectType { readonly counter: Signal<number>; }
    createSelectMap({ counter: dynamicSelector_withStateToken }); // $ExpectType { readonly counter: Signal<number>; }
  });
});
