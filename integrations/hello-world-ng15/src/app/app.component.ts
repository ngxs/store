import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { CounterState, Increment } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  counter$ = this.store.select<number>(CounterState);

  constructor(private store: Store) {}

  increment(): void {
    this.store.dispatch(new Increment());
  }
}
