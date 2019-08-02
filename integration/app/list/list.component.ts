import { Component } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
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
  @Select(RouterState.getRouteSnapshot(ListComponent))
  public snapshot$: Observable<ActivatedRouteSnapshot | null>;

  public getListDisplayText(stream: string, animals: string[]): string {
    return `Animals were resolved via the "${stream}" stream ${animals.join(',')}`;
  }
}
