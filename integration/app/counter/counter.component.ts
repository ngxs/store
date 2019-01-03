import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { CounterStateChangeAction } from '@integration/counter/counter.actions';
import { CounterState, CounterStateModel } from '@integration/counter/counter.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'counter',
  templateUrl: './counter.component.html'
})
export class CounterComponent implements OnInit {
  @Select(CounterState) public counter$: Observable<CounterStateModel>;

  constructor(private store: Store) {}

  public ngOnInit() {
    this.store.dispatch(new CounterStateChangeAction());
  }
}
