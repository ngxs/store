# Caching
Caching requests executed by Actions is a common practice. NGXS does not
provide this ability out of the box, but it is easy to implement.

There are many different ways to approach this. Below is a simple example of
using the store's current values and returning them instead of calling the HTTP
service.

```TS
import { State, Action, StateContext } from '@ngxs/store';
import { of } from 'rxjs/observable/of';
import { tap } from 'rxjs/operators';

export class GetZebra {
  static readonly type = '[Zoo] GetZebra';
  constructor(public id: string) {}
}

@State<ZooStateModel>({
  defaults: {
    zebras: []
  }
})
export class ZooState {

  constructor(private animalService: AnimalService) {}

  @Action(GetZebra)
  getZebra(ctx: StateContext<ZooStateModel>, action: GetZebra) {
    const state = ctx.getState();
    // payload = id of animal
    const idx = state.zebras.findIndex(zebra => zebra.id === action.id);
    if (idx > -1) {
      // if we have the cache, just return it from the store
      return dispatch(new GetZebraSuccess(state.zebras[idx]));
    } else {
      return this.animalService.getZebra(action.id).pipe(
        map(resp => dispatch(new GetZebraSuccess(resp)))
      );
    }
  }

}
```
