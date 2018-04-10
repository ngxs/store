# Store
The store is a global state manager that dispatches actions your state 
containers listen to and provides a way to select data slices out from
the global state.

### Dispatching actions
To dispatch actions, you need to inject the `Store` service into your component/service
and invoke the `dispatch` function with a action or a array of actions you wish to trigger.

```TS
import { Store } from '@ngxs/store';
import { AddAnimal } from './animal.events';

@Component({ ... })
export class ZooComponent {
  constructor(private store: Store) {}

  addAnimal(name) {
    this.store.dispatch(new AddAnimal(name));
  }
}
```

You can also dispatch multiple events at the same time by passing an array of events like:

```TS
this.store.dispatch([
  new AddAnimal('Panda'),
  new AddAnimal('Zebra')
]);
```

Lets say after the event executes you want to clear
the form. Our `dispatch` function actually returns an observable, so we can
subscribe very easily and reset the form after it was successful.

```TS
import { Store } from '@ngxs/store';
import { AddAnimal } from './animal.events';

@Component({ ... })
export class ZooComponent {
  constructor(private store: Store) {}

  addAnimal(name) {
    this.store.dispatch(new AddAnimal(name)).subscribe(() => this.form.reset());
  }
}
```

The observable that dispatch returns has a void type, this is because
there can be multiple states that listen to the same `@Action`,
therefore its not realistically possible to return the state
from these actions since we don't know the form of them.

If you need to get the state after this, simply use a 
select in the chain like:

```TS
import { Store } from '@ngxs/store';
import { withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { AddAnimal } from './animal.events';

@Component({ ... })
export class ZooComponent {
  @Select(state => state.animals) animals$: Observable<any>;
  constructor(private store: Store) {}

  addAnimal(name) {
    this.store.dispatch(new AddAnimal(name))
      .pipe(withLatestFrom(this.animals$))
      .subscribe(([animals]) => {
        // do something with animals
        this.form.reset();
      });
  }
}
```

### Snapshots
You can get a snapshot of the state by calling `store.snapshot()`. It will return the entire
value of the store for that point in time.

### Selecting State
See the [select](select.md) page for details on how to use the store to select out data.
