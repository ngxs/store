# Caching
Caching requests executed by Actions is a common practice. NGXS does not
provide this ability out of the box, but it is easy to implement. 

There are many different ways to approach this, below is a simple example of
using the store's current values and returning it instead of calling the HTTP
service.

```javascript
import { State, Action } from 'ngxs';
import { of } from 'rxjs/observable/of';
import { tap } from 'rxjs/operators';

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
export class ZooState {

  constructor(private animalService: AnimalService) {}

  @Action(GetAnimals)
  get({ state }, { payload }) {
    // payload = id of animal
    const idx = state.animals.findIndex(animal => animal.id === payload);
    if (idx > -1) {
      // if we have the cache, just return it from the store
      return of(new GetAnimalsSuccess(state.animals[idx]));
    } else {
      return this.animalService.get(payload)
        .pipe(map(resp => new GetAnimalsSuccess(resp)));
    }
  }
}
```
