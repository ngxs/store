import { State, Action } from '../../src/public_api';

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
export class CounterState {
  constructor(private math: MathService) {}

  @Action(Increment)
  increment(state: number) {
    return this.math.add(state, 1);
  }

  @Action(Decrement)
  decrement(state: number) {
    return this.math.subtract(state, 1);
  }
}
