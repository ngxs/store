import { CommonModule } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { RouterState } from '@ngxs/router-plugin';
import { Observable } from 'rxjs';

import { ListState } from '@integration/list/list.state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  imports: [CommonModule]
})
export class ListComponent {
  private _store = inject(Store);

  list$: Observable<string[]> = this._store.select(ListState.getListState);
  list: Signal<string[]> = this._store.selectSignal(ListState.getListState);

  hello$ = this._store.select(ListState.getHello);
  hello = this._store.selectSignal(ListState.getHello);

  router$ = this._store.select<RouterStateSnapshot | undefined>(RouterState.state());
  router = this._store.selectSignal<RouterStateSnapshot | undefined>(RouterState.state());
}
