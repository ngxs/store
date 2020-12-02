import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { CounterState, Increment } from './store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @Select(CounterState) counter$: Observable<number> | undefined;

  constructor(private store: Store) {}

  increment(): void {
    this.store.dispatch(new Increment());
  }
}
