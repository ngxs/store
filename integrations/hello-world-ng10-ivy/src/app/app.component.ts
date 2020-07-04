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
  title = 'hello-world-ng10-ivy';
  @Select(CounterState) counter$: Observable<number>;

  constructor(private store: Store) {}

  increment(): void {
    this.store.dispatch(new Increment());
  }
}
