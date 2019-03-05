import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { RouterState } from '@ngxs/router-plugin';
import { Observable } from 'rxjs';

import { ListState } from '@integration/list/list.state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent {
  @Select(ListState) public list$: Observable<string[]>;
  @Select(ListState.hello) public foo: Observable<string>;
  @Select(RouterState.state) public router$: Observable<RouterState>;
}
