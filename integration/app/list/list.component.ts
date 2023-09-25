import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { RouterState } from '@ngxs/router-plugin';
import { Observable } from 'rxjs';

import { ListState } from '@integration/list/list.state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent {
  list$: Observable<string[]> = this._store.select(ListState);
  hello$ = this._store.select(ListState.getHello);
  router$ = this._store.select(RouterState.state);

  constructor(private _store: Store) {}
}
