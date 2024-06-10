import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { COUNTER_STATE_TOKEN, Increment } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  counter$ = this.store.select<number>(COUNTER_STATE_TOKEN);

  constructor(private store: Store) {}

  increment(): void {
    this.store.dispatch(new Increment());
  }
}
