import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { DetailFooActions } from './detail.actions';
import { DetailState, DetailStateModel } from './detail.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-detail',
  template: `
    <a [routerLink]="['/list']">List</a> {{ detail$ | async | json }}
    <br><br><button (click)="updateFoo()">Update foo</button>
  `
})
export class DetailComponent {
  @Select(DetailState)
  detail$: Observable<DetailStateModel>;

  constructor(private store: Store) {}

  public updateFoo() {
    this.store.dispatch(new DetailFooActions(false));
  }
}
