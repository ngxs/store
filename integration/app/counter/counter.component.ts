import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { CounterStateChangeAction } from '@integration/counter/counter.actions';
import { CounterState, CounterStateModel } from '@integration/counter/counter.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'counter',
  templateUrl: './counter.component.html'
})
export class CounterComponent implements OnInit {
  counter$: Observable<CounterStateModel> = this._store.select(CounterState);

  constructor(private _store: Store) {}

  ngOnInit() {
    this._store.dispatch(new CounterStateChangeAction());
  }
}
