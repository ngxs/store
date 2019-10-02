# Store
The store is a global state manager that dispatches actions your state 
containers listen to and provides a way to select data slices out from
the global state.

### Creating actions
An action example in `animal.actions.ts`.

```TS
export class AddAnimal {
  static readonly type = '[Zoo] Add Animal';
  constructor(public name: string) {}
}
```

### Dispatching actions
To dispatch actions, you need to inject the `Store` service into your component/service
and invoke the `dispatch` function with an action or an array of actions you wish to trigger.

```TS
import { Store } from '@ngxs/store';
import { AddAnimal } from './animal.actions';

@Component({ ... })
export class ZooComponent {
  constructor(private store: Store) {}

  addAnimal(name: string) {
    this.store.dispatch(new AddAnimal(name));
  }
}
```

You can also dispatch multiple actions at the same time by passing an array of actions like:

```TS
this.store.dispatch([
  new AddAnimal('Panda'),
  new AddAnimal('Zebra')
]);
```

Let's say after the action executes you want to clear
the form. Our `dispatch` function actually returns an Observable, so we can
subscribe to it and reset the form after it was successful.

```TS
import { Store } from '@ngxs/store';
import { AddAnimal } from './animal.actions';

@Component({ ... })
export class ZooComponent {

  constructor(private store: Store) {}

  addAnimal(name: string) {
    this.store.dispatch(new AddAnimal(name)).subscribe(() => this.form.reset());
  }

}
```

The Observable that a dispatch returns has a void type, this is because
there can be multiple states that listen to the same `@Action`,
therefore it's not realistically possible to return the state
from these actions since we don't know the form of them.

If you need to get the state after this, simply use a 
`@Select` in the chain like:

```TS
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { AddAnimal } from './animal.actions';

@Component({ ... })
export class ZooComponent {

  @Select(state => state.animals) animals$: Observable<any>;

  constructor(private store: Store) {}

  addAnimal(name: string) {
    this.store
      .dispatch(new AddAnimal(name))
      .pipe(withLatestFrom(this.animals$))
      .subscribe(([_, animals]) => {
        // do something with animals
        this.form.reset();
      });
  }

}
```

### Snapshots
You can get a snapshot of the state by calling `store.snapshot()`. This will return the entire
value of the store for that point in time.

### Selecting State
See the [select](select.md) page for details on how to use the store to select data.

### Reset
In certain situations you need the ability to reset the state in its entirety without
triggering any actions or life-cycle hooks. One example of this would be redux devtools plugin
when we are doing time travel. Another example would be when we are unit testing and need
the state to be a specific value for isolated testing.

`store.reset(myNewStateObject)` will reset the entire state to the passed argument without firing
any actions or life-cycle events.

Warning: Using this can cause unintended side effects if improperly used and should be used with caution!
