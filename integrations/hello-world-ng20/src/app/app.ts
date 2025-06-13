import { Component, inject } from '@angular/core';
import { select, Store } from '@ngxs/store';

import { Increment, COUNTER_STATE_TOKEN } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private store = inject(Store);

  readonly counter = select(COUNTER_STATE_TOKEN);

  increment(): void {
    this.store.dispatch(new Increment());
  }
}
