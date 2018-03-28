# Store
The store is a global state manager that dispatches actions your state 
containers listen to and provides a way to select data slices out from
the global state.

### Dispatching actions
To dispatch actions, you need to inject the `Store` service into your component/service
and invoke the `dispatch` function with a action or a array of actions you wish to trigger.

```javascript
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

```javascript
this.store.dispatch([
  new AddAnimal('Panda'),
  new AddAnimal('Zebra')
]);
```

Lets say after the event executes you want to clear
the form. Our `dispatch` function actually returns an observable, so we can
subscribe very easily and reset the form after it was successful.

```javascript
import { Store } from '@ngxs/store';
import { AddAnimal } from './animal.events';

@Component({ ... })
export class ZooComponent {
  constructor(private store: Store) {}

  addAnimal(name) {
    this.store.dispatch(new AddAnimal(name)).subscribe(() => {
      this.form.reset();
    });
  }
}
```

The observable has not result arguments since this a action can lead
to multiple different control flows affecting multiple different state
containers therefore its not realistically possible to return the state
from that action. If you need to get the state after this, simply use a 
select in the chain like:

```javascript
import { Store } from '@ngxs/store';
import { AddAnimal } from './animal.events';
import { withLatestFrom } from 'rxjs/oprators';
import { Observable } from 'rxjs/Observable';

@Component({ ... })
export class ZooComponent {
  @Select(state => state.animals) animals$: Observable<any>;
  constructor(private store: Store) {}

  addAnimal(name) {
    this.store.dispatch(new AddAnimal(name))
      .pipe(withLatestFrom(this.animals$))
      .subscribe(([,animals]) => {
        // do something with animals
        this.form.reset();
      });
  }
}
```

### Selecting State
See the [select](select.md) page for details on how to use the store to select out data.
