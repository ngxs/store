import { Component, Signal } from '@angular/core';
import { Store } from '@ngxs/store';

import { DetailState } from '@integration/detail/detail.state';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent {
  detail: Signal<boolean> = this._store.selectSignal(DetailState);

  constructor(private _store: Store) {}
}
