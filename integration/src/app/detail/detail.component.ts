import { CommonModule } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { DetailState, DetailStateModel } from '@integration/detail/detail.state';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  imports: [CommonModule]
})
export class DetailComponent {
  private _store = inject(Store);

  detail$: Observable<DetailStateModel> = this._store.select(DetailState.getDetailState);
  detail: Signal<DetailStateModel> = this._store.selectSignal(DetailState.getDetailState);
}
