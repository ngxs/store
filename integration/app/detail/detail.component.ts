import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { DetailState } from '@integration/detail/detail.state';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent {
  detail$: Observable<boolean> = this._store.select(DetailState);

  constructor(private _store: Store) {}
}
