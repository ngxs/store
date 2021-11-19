import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';

import { Increment } from './counter.actions';

@State<number>({
  name: 'counter',
  defaults: 0
})
@Injectable()
export class CounterState {
  @Action(Increment)
  increment(ctx: StateContext<number>) {
    ctx.setState(counter => (counter += 1));
  }
}
