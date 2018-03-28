# Canceling

If you have an async action sometimes you want to cancel a previous observable if the action is dispatched again. We can handle this with the `takeUntil` operator.

```TS
import { State, Action, Actions, ofAction } from '@ngxs/store';
import { tap } from 'rxjs/operators';

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FeedAnimals)
  get({ getState, setState }, { payload }) {
    return this.animalService.get(payload).pipe(
      tap((res) => {
        setState(res)
      }),
      takeUntil(this.actions.pipe(ofAction(RemoveTodo)))
    ));
  }
}
```
