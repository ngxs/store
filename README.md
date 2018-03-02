<p align="center">
  <img src="assets/logo.png">
  <br />
  NGX is a state management pattern + library for Angular.
</p>


See [Changelog](CHANGELOG.md) for latest changes.

## What is NGXS?
NGX is a state management pattern + library for Angular. It acts as a single source of
truth for your application's state providing simple rules for predictable state mutations.

NGXS is modeled after the CQRS pattern popularly implemented in libraries like Redux and NGRX
but reduces much of the boilerplate that is usually associated with those patterns by using
modern TypeScript language features such as classes and decorators.

when in include the module in the import, you can pass root stores
along with options. If you are lazy loading, you can use the `forFeature`
option with the same arguments.

## Installing
To get started, lets install the package thru npm:

```
npm i ngxs --S
```

then in our `app.module.ts` file, lets import the NgModule:

```javascript
import { NgModule } from '@angular/core';
import { NgxsModule } from 'ngxs';

@NgModule({
    imports: [
        NgxsModule.forRoot([
            ZooStore
        ], { /* options */ })
    ]
})
```

### Concepts
### Events
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

In the above events, we have `FeedAnimals` which has payload for it. Its just
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

### Stores
Next lets define a store class. To do this we create a ES6 class
and decorate it with a `Store` decorator. The `Store` decorator
accepts a few different options:

- `name`: Optional name of the store. If not pass it will take
the name of the class, camel case it and remove the word `Store` from the end.
- `defaults`: A set of default options to initialize our store with.

So here is our basic store:

```javascript
import { Store } from 'ngxs';

@Store({
    defaults: {
        feed: false,
        animals: []
    }
})
export class ZooStore {}
```

because I didn't pass a name, it will use the name `zoo`. Next,
let define a `Mutation`. 

### Mutations
A mutation is function that will manipulate the state.

```javascript
import { Store, Mutation } from 'ngxs';

@Store({
    defaults: {
        feed: false,
        animals: []
    }
})
export class ZooStore {
    @Mutation(FeedAnimals)
    feedAnimals(state, { payload }) {
        state.feed = true;
    }
}
```

The above mutation listens for the `FeedAnimals` event to be dispatched
and then updates the `feed` flag in our store. Our stores are immutable
so when updating properties make sure you return new instances. You don't
need to return a new instance of the state because ngxs will handle doing
a shallow clone for you.

The arguments of the mutation are the current state along with the event.
In the above example I used destructuring to get the payload out. But remember
events don't have to have payloads.

The `Mutation` decorator can also take multiple actions, so you could do:

```
@Mutation([FeedAnimals, WaterAnimals])
```

### Actions
Mutations should not reach out to backend services or do async operations.
Those are reserved for `Action`. Similarly actions should not mutate state.
Lets say for our `NewAnimal` event we want to reach out to the backend and save the
new animal before we add it to the UI.

Our stores can also participate in depedency injection so when we want to
reach out to our backend injectable service, we can just inject it. When
using DI, its important to remember to add the `Injectable` decorator
and also add your store to your module's providers.

The arguments of the function are similar to those of the mutation, passing
the state and the action. Lets see what this looks like:

```javascript
import { Store, Action } from 'ngxs';

@Injectable()
@Store({
    defaults: {
        feed: false,
        animals: []
    }
})
export class ZooStore {
    constructor(private animalService: AnimalService) {}

    @Action(NewAnimal)
    newAnimal(state, { payload }) {
        return this.animalService.save(payload).map((res) => new AnimalSuccess(res));
    }
}
```

In this example our `AnimalService` calls out to our backend and returns an observable.
We map the result of that observable into a new event passing the results as the payload.
It will automatically map observables, promises and raw events for you. So you can do things like:

```javascript
/** Returns a observable event */
@Action(NewAnimal)
newAnimal(state, { payload }) {
    return this.animalService.save(payload).map((res) => new AnimalSuccess(res));
}

/** Returns a observable with an array of events */
@Action(NewAnimal)
newAnimal(state, { payload }) {
    return this.animalService.save(payload).map((res) => [
        new AnimalSuccess(res),
        new AlertZooKeeper()
    ]);
}

/** Return a raw event */
@Action(NewAnimal)
newAnimal(state, { payload }) {
    return this.animalService.save(payload);
    return new AnimalSuccess();
}

/** Return promises */
@Action(NewAnimal)
newAnimal(state, { payload }) {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

/** Async/Await */
@Action(NewAnimal)
async newAnimal(state, { payload }) {
    await this.animalService.save(payload);
    return new AnimalSuccess();
}
```

Its pretty flexible, it doesn't try to push you into a certain
way but provides you a mechanism to handle your control flows
how you want.

Now that we have called out to the backend and saved the animal,
we need to connect the dots and save the animal to our store. Thats
super easy, since its just another mutation that adds our animal
to the store:

```javascript
@Store({
    defaults: {
        feed: false,
        animals: []
    }
})
export class ZooStore {
    constructor(private animalService: AnimalService) {}

    @Mutation(NewAnimalSuccess)
    newAnimalSuccess(state, { payload }) {
        state.animals = [...state.animals, payload];
    }

    @Action(NewAnimal)
    newAnimal(state, { payload }) {
        return this.animalService.save(payload).map((res) => new AnimalSuccess(res));
    }
}
```

### Dispatching events
So we've covered what our store looks like, but how do we trigger these events? In
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
        })
    }
}
```

The subscription doesn't return any data, so if you need that
you will need to get the data using a select. Speaking of a
getting the data, lets talk about Selects now. 

### Selects
Its important to note that READS and WRITES are completely seperate in ngxs. To read data
out of the store, we can either call the `select` method on the 
`ngxs` service. First lets look at the `select` method.

```javascript
import { Ngxs } from 'ngxs';
import { AddAnimal } from './animal.actions';

@Component({ ... })
export class ZooComponent {
    animals$: Observable<string[]>;
    constructor(private ngxs: Ngxs) {
        this.animals$ = this.ngxs.select(state => state.zoo.animals);
    }
}
```

Thats pretty similar to Redux and NGRX. We can use a handy decorator
the same way but with some other options.


```javascript
import { Ngxs } from 'ngxs';
import { AddAnimal } from './animal.actions';

@Component({ ... })
export class ZooComponent {
    // Reads the name of the property minus the $
    @Select() animals$: Observable<string[]>;

    // Reads the parameter passed to the select decorator
    @Select('animals') animals$: Observable<string[]>;

    // These properties can be nested too
    @Select('animals.names') animals$: Observable<string[]>;

    // These properties can be in the form of an array too
    @Select(['animals', 'names']) animals$: Observable<string[]>;

    // Also accepts a function like our select method
    @Select(state => state.animals) animals$: Observable<string[]>;
}
```

Pretty cool huh? Lots of options to get data out! 

### Plugins
Next lets talk about plugins. Similar to Redux's meta reducers, we have
a plugins interface that allows you to build a global plugin for your state. Lets 
take a basic example of a logger:

```javascript
import { NgxsPlugin } from 'ngxs';

export class LoggerPlugin implements NgxsPlugin {
    handle(state, action) {
        console.log('Action happened!');
    }
}
```

Our plugins can also have injectables, simply decorator it with
the `Injectable` decorator and pass it to your providers.

### Pub sub
Lets you want to listen to events outside of your store or perhaps you want to
create a pub sub scenario where an event might not be tied to a store at all.
To do this, we can inject the `EventStream` observable and just listen in.
To make determining if the event is what we actually want to listen to, we have a 
RxJS pippeable operator called `ofEvent(NewAnimal)` we can use too!

```javascript
import { EventStream, ofEvent } from 'ngxs';

@Injectable()
export class RouteHandler {
    constructor(private eventStream: EventStream, private router: Router) {
        this.eventStream.pipe(ofEvent(NewAnimal)).subscribe((action) => alert('New Animal!'));
    }
}

## Roadmap
We have lots planned for the future, here is a break down of whats coming next!

- [ ] Devtools
- [ ] Reactive forms plugin
- [ ] Localstorage plugin
- [ ] Web worker plugin
