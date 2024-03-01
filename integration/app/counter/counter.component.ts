import { Component, OnInit, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { CounterStateChangeAction } from '@integration/counter/counter.actions';
import { CounterState, CounterStateModel } from '@integration/counter/counter.state';

@Component({
  selector: 'counter',
  templateUrl: './counter.component.html'
})
export class CounterComponent implements OnInit {
  counter$: Observable<CounterStateModel> = this._store.select(CounterState.getCounterState);
  counter: Signal<CounterStateModel> = this._store.selectSignal(CounterState.getCounterState);

  constructor(private _store: Store) {}

  ngOnInit() {
    this._store.dispatch(new CounterStateChangeAction());
  }
}
