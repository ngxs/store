import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Select } from '@ngxs/store';
import { ListState } from './list.state';

@Component({
  selector: 'app-list',
  template: `
    <div>
      <a [routerLink]="['/detail']">Detail</a>
      {{list$ | async}}

      {{foo | async}}
    </div>
  `
})
export class ListComponent {
  @Select(ListState) list$: Observable<string[]>;

  @Select(ListState.hello) foo;
}
