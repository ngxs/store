<p align="center">
  <img src="assets/logo.png">
  <br />
  NGXS is a state management pattern + library for Angular
  [![Join the chat at https://gitter.im/ngxs-community/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ngxs-community/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)  [![npm version](https://badge.fury.io/js/ngxs.svg)](https://badge.fury.io/js/ngxs) [![Maintainability](https://api.codeclimate.com/v1/badges/8cfd57431e95ce1b994c/maintainability)](https://codeclimate.com/github/amcdnl/ngxs/maintainability)
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

then in `app.module.ts`, import the `NgModule`:

```javascript
import { NgModule } from '@angular/core';
import { NgxsModule } from 'ngxs';

@NgModule({
    imports: [
        NgxsModule.forRoot([
            ZooStore
        ], { /* optional options */ })
    ]
})
```

When you include the module in the import, you can pass root stores along with options.
If you are lazy loading, you can use the `forFeature` option with the same arguments.

## Concepts
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

If you don't want it to shallow copy the state,
you can just return the state as is and it won't copy it, like this:

```javascript
@Mutation(FeedAnimals)
feedAnimals(state, { payload }) {
    if (state.feed === payload) {
        // return without touching and ngxs won't shallow copy
        return state;
    }
}
```

The arguments of the mutation are the current state along with the event.
In the above example I used destructuring to get the payload out. But remember
events don't have to have payloads.

The `Mutation` decorator can also take multiple actions, so you could do:

```javascript
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
`ngxs` service or a `@Select` decorator. First lets look at the `select` method.

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
a plugins interface that allows you to build a global plugin for your state. 

Lets  take a basic example of a logger:

```javascript
import { NgxsPlugin } from 'ngxs';

export class LoggerPlugin implements NgxsPlugin {
    handle(state, mutation, next) {
        console.log('Mutation started!', state);
        const result = next(state, mutation);
        console.log('Mutation happened!', result);
        return result;
    }
}
```

Our plugins can also have injectables, simply decorator it with
the `Injectable` decorator and pass it to your providers. If your plugins
has options associated with it, we suggest defining a static method called
`forRoot` similar to Angular's pattern. This would look like:

```javascript
export class LoggerPlugin implements NgxsPlugin {
    static _options;
    static forRoot(options) { this._options = options; }
    handle(state, mutation, next) {
        console.log('Custom options!', LoggerPlugin._options);
        return next(state, mutation);
    }
}
```

This pattern allows us to define options while presevering the constructor
for use with DI.

You can also use pure functions for plugins, the above example in a pure function
would look like this:

```javascript
export function logPlugin(state, mutation, next) {
    console.log('Mutation started!', state);
    const result = next(state, mutation);
    console.log('Mutation happened!', result);
    return result;
}
```

To register them with NGXS, pass them via the options parameter
in the module hookup like:

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

#### Logger Plugin
NGXS comes with a logger plugin for common debugging usage. To take advantage of this
simply import it, configure it and add it to your plugins options.

```javascript
import { LoggerPlugin } from 'ngxs';

@NgModule({
    imports: [
        NgxsModule.forRoot([ZooStore], {
            plugins: [
                // Default setup
                LoggerPlugin

                // Pass custom options
                LoggerPlugin.forRoot({
                  // custom console.log implement
                  logger: console,

                  // expand results by default
                  expanded: true
                })
            ]
        })
    ]
})
```

#### Redux Devtools
To enable support for the [Redux Devtools extension](http://extension.remotedev.io/),
add the following plugin to your `forRoot` configuration:

```javascript
import { NgxsModule, ReduxDevtoolsPlugin } from 'ngxs';

@NgModule({
    imports: [
        NgxsModule.forRoot([], {
            plugins: [ReduxDevtoolsPlugin]
        })
    ]
})
```

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
        this.eventStream
          .pipe(ofEvent(NewAnimal))
          .subscribe((action) => alert('New Animal!'));
    }
}
```

### Unit Testing
Unit testing is easy since, we just need to dispatch events and then listen in on the changes and
perform our expectation there. A basic test looks like this:

```javascript
describe('Zoo', () => {
  let ngxs: Ngxs;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ZooStore])],
      providers: [ZooStore],
    }).compileComponents();
    ngxs = TestBed.get(Ngxs);
  }));

  it('it toggles feed', () => {
    ngxs.dispatch(new FeedAnimals());
    ngxs.select(state => state.zoo.feed).subscribe(feed => {
      expect(feed).toBe(true);
    });
  });

});
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
- Unit tests for the store should be named `my-store-name.store.spec.ts`
- Events should ALWAYS use the `payload` public name
- Actions can live within the store file but are recommended to be a seperate file like: `zoo.events.ts`
- Mutations should NEVER perform async operations
- Actions should NEVER mutate the state directly
- Actions should NOT deal with view related operations (i.e. showing popups/etc)

## Roadmap
We have lots planned for the future, here is a break down of whats coming next!

- [ ] Reactive forms plugin
- [ ] Localstorage plugin
- [ ] Reactive forms plugin
- [ ] Router plugin
- [ ] Web worker plugin

## Shameless plug
If you are using this tool and need support with it or with Angular in general, I offer full service
consulting. My contact information is in my Github profile.
