import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { CounterState, Increment } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @Select(CounterState) counter$: Observable<number>;

  constructor(private store: Store) {}

  increment(): void {
    this.store.dispatch(new Increment());
  }
}
