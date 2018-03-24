import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';

@Component({
  selector: 'app-list',
  template: `
    <div>
      <a [routerLink]="['/detail']">Detail</a>
      {{list$ | async}}
    </div>
  `
})
export class ListComponent {
  @Select('list') list$: Observable<string[]>;
}
