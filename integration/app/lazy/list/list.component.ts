import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ListState } from '@integration/store/list/list.state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent {
  @Select(ListState) public list$: Observable<string[]>;
  @Select(ListState.hello) public foo: Observable<string>;
}
