# Store
The store is the global state manager, it:

- Dispatches actions for which the states listen to
- Selects state slices from the state

### Dispatching actions
To dispatch actions, you need to inject the `Store` service into your component/service
and invoke the `dispatch` function with a action or a array of actions you wish to trigger.

```javascript
import { Store } from 'ngxs';
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
import { Store } from 'ngxs';
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

### Selecting State
See the [select](select.md) page for details on how to use the store to select out data.
