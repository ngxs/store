import { Service } from '@angular/core';
import { State, Action, StateContext, StateToken } from '@ngxs/store';

import { Increment } from './counter.actions';

export const COUNTER_STATE_TOKEN = new StateToken<number>('counter');

@State<number>({
  name: COUNTER_STATE_TOKEN,
  defaults: 0
})
@Service({ autoProvided: false })
export class CounterState {
  @Action(Increment)
  increment(ctx: StateContext<number>) {
    ctx.setState(counter => (counter += 1));
  }
}
