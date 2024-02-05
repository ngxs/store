import { Component, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { RouterState } from '@ngxs/router-plugin';

import { ListState } from '@integration/list/list.state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent {
  list: Signal<string[]> = this._store.selectSignal(ListState);
  hello = this._store.selectSignal(ListState.getHello);
  router = this._store.selectSignal(RouterState.state);

  constructor(private _store: Store) {}
}
