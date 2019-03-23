import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { DetailState } from '@integration/detail/detail.state';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent {
  @Select(DetailState) detail$: Observable<boolean>;
}
