# Events

## What is an event?
Lets define what our store is going to do. We call these event classes. They
will be what we dispatch and our stores respond to. For this store, we will define
the following:

```javascript
export class FeedAnimals {}
export class NewAnimal {
  constructor(public payload: string) {}
}
export class NewAnimalSuccess {}
```

In the above events, we have `FeedAnimals` which has no payload for it. Its just
going to flip a simple flag in our store for us. In the `NewAnimal` event we define
a payload which will contain the animal type. Unlike with redux, we don't need to
define a type property since our store is smart enough to read the class as the type.
You can optionally include a type if you want to make the event more descriptive, that
looks like this:

```javascript
export class NewAnimal {
  readonly static type = 'I got a new animal today!';
}
```

### Dispatching events
So we've covered what our events looks like, but how do we trigger these events? In
your component, you simply inject the `Ngxs` service and call dispatch with the event
class from there.

```javascript
import { Ngxs } from 'ngxs';
import { AddAnimal } from './animal.actions';

@Component({ ... })
export class ZooComponent {
  constructor(private ngxs: Ngxs) {}

  addAnimal(name) {
    this.ngxs.dispatch(new AddAnimal(name));
  }
}
```

And the rest is magic! You can also dispatch multiple events at the same
time by passing an array of actions like:

```javascript
this.ngxs.dispatch([
  new AddAnimal('Panda'),
  new AddAnimal('Zebra')
]);
```

Lets say after the action executes you want to clear
the form. Our `dispatch` function actually returns an observable, so we can
subscribe very easily and reset the form after it was successful.

```javascript
import { Ngxs } from 'ngxs';
import { AddAnimal } from './animal.actions';

@Component({ ... })
export class ZooComponent {
  constructor(private ngxs: Ngxs) {}

  addAnimal(name) {
    this.ngxs.dispatch(new AddAnimal(name)).subscribe(() => {
      this.form.reset();
    });
  }
}
```
