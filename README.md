<p align="center">
  <img src="assets/logo.png">
  <br />
  NGXS is a state management pattern + library for Angular
  <br />
</p>

## What is NGXS?
NGXS is a state management pattern + library for Angular. It acts as a single source of
truth for your application's state, providing simple rules for predictable state mutations.

NGXS is modeled after the CQRS pattern popularly implemented in libraries like Redux and NGRX
but reduces boilerplate by using modern TypeScript features such as classes and decorators.

- See it in action on [Stackblitz](https://stackblitz.com/edit/ngxs-simple)
- Learn about updates on the [changelog](CHANGELOG.md)

## Installing
To get started, install the package thru npm:

```
npm i ngxs --S
```

then in `app.module.ts`, import the NgModule:

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

When you include the module in the import, you can pass root stores
along with options. 
//: you 'can' pass or you 'must' pass? Will it work if you don't pass 
//: a root store? If not, this should say 'you will pass' or something like that.

If you are lazy loading, you can use the `forFeature` option with the same arguments.

When you initialize the module, you'll pass in a root store and you can also pass in options. 
//: where can we find the optional parameters? 

## Concepts
### Events
Lets define what our store is going to do. We call these event classes. They
will be dispatched and trigger a response from the store. Here's an example store: 

```javascript
export class FeedAnimals {}
export class NewAnimal {
    constructor(public payload: string) {}
}
export class NewAnimalSuccess {}
```

In this example, `FeedAnimals` has no payload. It will only flip a simple flag
in our store . The `NewAnimal` event has a payload which contains the animal type. 
Unlike redux, the type property is not required in this store because it can use 
the class as the type. If you'd like to include a type to make the event more descriptive, 
it would look like this:

```javascript
export class NewAnimal {
    readonly static type = 'I got a new animal today!';
}
```

### Stores
Next, lets define a store class. To do this we create an ES6 class
with a `Store` decorator. The `Store` decorator accepts these options:

- `name`: (optional) If not provided, store name will be generated from class name.
- `defaults`: (optional) 
//: where are the default/optional settings? 

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

because I didn't pass a name, it will name the store `zoo`. 

Next, let define a `Mutation`. 

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
//: can we hyperlink the word immutable to a wikipedia page or blog post 
//: for anyone not familiar? Maybe https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns 
so when updating properties make sure you return new instances. NGXS will
do a shallow clone so you don't need to return a new instance of state.

The arguments of the mutation are the current state along with the event.
In the above example I used destructuring to extract the payload, but remember
the payload is not required.

The `Mutation` decorator can also take multiple actions, for instance:

```javascript
@Mutation([FeedAnimals, WaterAnimals])
```

### Actions
__Mutations should not interact with backend services or do async operations.__
__Those are reserved for `Action`. Similarly, actions should not mutate state.__

Lets say for our `NewAnimal` event, we want to save the new animal to the server
before we add it to the UI.

NGXS can also handle depedency injection, so if we have a service to interact with
our server or database, we can just inject it! When using DI, just remember to add 
the `Injectable` decorator and also add your store to your module's providers.

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

In this example, `AnimalService` calls out to our backend and returns an observable.
We map the result of that observable into a new event, passing the results as the payload.
NGXS will automatically map observables, promises, and raw events so you can do things like:

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

__NGXS was designed to be flexible, providing a mechanism which__
__allows you to handle and customize your own control flow.__

Now that we have successfully sent the animal to our server,
we're ready to save the animal to our store. We'll do that with 
another mutation:

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
your component, simply inject the `Ngxs` service and call dispatch with the event
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

If you'd like to dispatch a series of events, it looks like this:

```javascript
this.ngxs.dispatch([
    new AddAnimal('Panda'),
    new AddAnimal('Zebra')
]);
```

Lets say you want to clear the form after the action executes. 
`dispatch` returns an observable, so it's easy to
subscribe and reset the form after it was successful.

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

The subscription doesn't return data, so if you need to access data you'll want to
use a select.  

### Selects
Its important to note that READS and WRITES are handled separately in NGXS. To read data
out of the store, we can either call the `select` method on the `ngxs` service. 
//: huh? You lost me here - should this say select OR ngxs? 
//: you talked about select below but I scrolled down and didn't find the other option...
//: I are confuzed...ngxs service? The next section is plugins, is that the same thing?

First lets look at the `select` method.

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

NGXS uses a decorator similar to Redux and NGRX, but allows additional options for accessing data.


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

### Plugins
Similar to Redux's meta reducers, NGXS provides a plugins interface 
which allows you to build a global plugin for your state. Here's a 
basic example of a logger:

```javascript
import { NgxsPlugin } from 'ngxs';

export class LoggerPlugin implements NgxsPlugin {
    handle(state, action) {
        console.log('Action happened!');
    }
}
```

NGXS plugins can also contain injectables, simply include
the `Injectable` decorator and pass it to your providers.

To register them with NGXS, pass them via the options parameter
in the module hookup:

```javascript
@NgModule({
    imports: [
        NgxsModule.forRoot([
            ZooStore
        ], {
            plugins: [LoggerPlugin]
        })
    ]
})
```

It also works with `forFeature`.

### Pub sub
You might want to listen to events outside of your store or to
create a pub sub scenario where an event might not be tied to a store at all.
To do this, inject the `EventStream` observable and just listen in.
To determine if the event is what we want, we have a 
RxJS pipeable operator called `ofEvent(NewAnimal)` we can use too!

```javascript
import { EventStream, ofEvent } from 'ngxs';

@Injectable()
export class RouteHandler {
    constructor(private eventStream: EventStream, private router: Router) {
        this.eventStream.pipe(ofEvent(NewAnimal)).subscribe((action) => alert('New Animal!'));
    }
}
```

### Style Guide
Below are suggestions for naming and style conventions.

- Stores should always have the `Store` suffix. Right: `ZooStore` Wrong: `Zoo`
- Stores should have a `.store.ts` suffix for the filename
- Selects should have a `$` suffix. Right: `animals$` Wrong: `animals`
- Plugins should end with the `Plugin` suffix
- Global stores should be organized under `src/shared/store`
- Feature stores should live within the respective feature folder structure `src/app/my-feature`
- Events should NOT have a a suffix
- Events should ALWAYS use the `payload` public name
- Actions can live within the store file but are recommended to be a seperate file like: `zoo.actions.ts`
- Mutations should NEVER perform async operations
- Actions should NEVER mutate the state directly
- Actions should NOT deal with view related operations (i.e. showing popups/etc)

## Roadmap
We have lots planned for the future, here is a break down of whats coming next!

- [ ] Devtools
- [ ] Reactive forms plugin
- [ ] Localstorage plugin
- [ ] Web worker plugin
