# Canceling
If you have an async action, you may want to cancel a previous Observable if the action has been dispatched again.
This is useful for canceling previous requests like in a typeahead.

## Basic
For basic scenarios, we can use the `cancelUncompleted` action decorator option.

```TS
import { State, Action } from '@ngxs/store';

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService, private actions$: Actions) {}

  @Action(FeedAnimals, { cancelUncompleted: true })
  get(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    return this.animalService.get(action.payload).pipe(
      tap((res) => ctx.setState(res))
    ));
  }
}
```

## Advanced
For more advanced cases such as using specifying based on tokens, we can use normal Rx operators.

```TS
import { State, Action, Actions, ofAction } from '@ngxs/store';
import { tap } from 'rxjs/operators';

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService, private actions$: Actions) {}

  @Action(FeedAnimals)
  get(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    return this.animalService.get(action.payload).pipe(
      tap((res) => ctx.setState(res)),
      takeUntil(this.actions$.pipe(ofAction(RemoveTodo)))
    ));
  }
}
```
