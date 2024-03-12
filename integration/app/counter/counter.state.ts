import {
  Action,
  NgxsAfterBootstrap,
  NgxsOnInit,
  Selector,
  State,
  StateContext
} from '@ngxs/store';
import { CounterStateChangeAction } from '@integration/counter/counter.actions';
import { Injectable } from '@angular/core';

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
@Injectable()
export class CounterState implements NgxsOnInit, NgxsAfterBootstrap {
  @Selector()
  static getCounterState(state: CounterStateModel) {
    return state;
  }

  ngxsOnInit(ctx: StateContext<CounterStateModel>): void {
    this.incrementAfterLoad(ctx);
  }

  ngxsAfterBootstrap(ctx: StateContext<CounterStateModel>): void {
    this.incrementAfterLoad(ctx);
  }

  @Action(CounterStateChangeAction)
  change({ setState }: StateContext<CounterStateModel>) {
    setState(state => ({ loaded: true, count: state.count + 1 }));
  }

  private incrementAfterLoad({ setState }: StateContext<CounterStateModel>): void {
    setTimeout(() => setState(state => ({ loaded: true, count: state.count + 1 })), 3000);
  }
}
