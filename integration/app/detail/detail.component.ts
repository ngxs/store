import { Component, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { DetailState, DetailStateModel } from '@integration/detail/detail.state';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent {
  detail$: Observable<DetailStateModel> = this._store.select(DetailState.getDetailState);
  detail: Signal<DetailStateModel> = this._store.selectSignal(DetailState.getDetailState);

  constructor(private _store: Store) {}
}
