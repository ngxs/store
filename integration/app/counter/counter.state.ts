import { Action, State, StateContext } from '@ngxs/store';
import { CounterStateChangeAction } from '@integration/counter/counter.actions';

export interface CounterStateModel {
  loaded: boolean;
  count: number;
}

@State<CounterStateModel>({
  name: 'counter',
  defaults: {
    loaded: false,
    count: 0
  }
})
export class CounterState {
  @Action(CounterStateChangeAction)
  public change({ setState }: StateContext<CounterStateModel>) {
    setState(state => ({ loaded: true, count: state.count + 1 }));
  }
}
