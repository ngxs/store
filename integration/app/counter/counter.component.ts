import { Component, OnInit, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { CounterStateChangeAction } from '@integration/counter/counter.actions';
import { CounterState, CounterStateModel } from '@integration/counter/counter.state';

@Component({
  selector: 'counter',
  templateUrl: './counter.component.html'
})
export class CounterComponent implements OnInit {
  counter: Signal<CounterStateModel> = this._store.selectSignal(CounterState);

  constructor(private _store: Store) {}

  ngOnInit() {
    this._store.dispatch(new CounterStateChangeAction());
  }
}
