# Caching
Caching requests executed by Actions is a common practice. NGXS does not
provide this ability out of the box, but it is easy to implement.

There are many different ways to approach this. Below is a simple example of
using the store's current values and returning them instead of calling the HTTP
service.

```TS
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export class GetZebra {
  static readonly type = '[Zoo] Get zebra';
  constructor(public id: number) {}
}

export class GetZebraSuccess {
  static readonly type = '[Zoo] Get zebra success';
  constructor(public zebra: Zebra) {}
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    zebras: []
  }
})
export class ZooState {

  @Selector()
  static getZebras(state: ZooStateModel): Zebra[] {
    return state.zebras;
  }

  constructor(private animalService: AnimalService) {}

  @Action(GetZebra)
  getZebra(ctx: StateContext<ZooStateModel>, action: GetZebra) {
    const state = ctx.getState();
    const index = state.zebras.findIndex(zebra => zebra.id === action.id);

    if (index > -1) {
      // if we have the cache, just return it from the store
      const zebra = state.zebras[index];
      return ctx.dispatch(new GetZebraSuccess(zebra));
    }

    return this.animalService
      .getZebra(action.id)
      .pipe(mergeMap(zebra => ctx.dispatch(new GetZebraSuccess(zebra))));
  }

}

```

Since the action `GetZebraSuccess` has no handlers that listens to it - we can still access the `zebra` property, thanks to the `ofActionDispatched` operator. The component code will look like this:

```ts
import { Component } from '@angular/core';
import { Select, Actions, Store, ofActionDispatched } from '@ngxs/store';

@Component({
  selector: 'app-zebras',
  template: `
    <app-selected-zebra *ngIf="zebra$ | async as zebra" [zebra]="zebra"></app-selected-zebra>
    <app-zebras-list *ngFor="let zebra of zebras$ | async" (getZebra)="getZebra($event)"></app-zebras-list>
  `
})
export class ZebrasComponent {

  @Select(ZooState.getZebras) zebras$: Observable<Zebra[]>;

  zebra$ = this.actions$.pipe(
    ofActionDispatched(GetZebraSuccess),
    map((action: GetZebraSuccess) => action.zebra)
  );

  constructor(private actions$: Actions, private store: Store) {}

  getZebra(id: number) {
    this.store.dispatch(new GetZebra(id));
  }

}
```
