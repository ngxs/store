import { State, Action, Selector, StateContext } from '../../src/public_api';
import { Injectable } from '@angular/core';

export class Increment {
  static readonly type = 'INCREMENT';
}
export class Decrement {
  static readonly type = 'DECREMENT';
}

export class MathService {
  add(val: number, count: number) {
    return val + count;
  }

  subtract(val: number, count: number) {
    return val - count;
  }
}

@State({
  name: 'counter',
  defaults: 0
})
@Injectable()
export class CounterState {
  @Selector()
  static getCounter(state: number) {
    return state;
  }

  constructor(private math: MathService) {}

  @Action(Increment)
  increment(ctx: StateContext<number>) {
    ctx.setState(state => this.math.add(state, 1));
  }

  @Action(Decrement)
  decrement(ctx: StateContext<number>) {
    ctx.setState(state => this.math.subtract(state, 1));
  }
}
