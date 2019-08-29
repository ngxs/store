# State
States are classes that define a state container.

## Defining a State
States are classes along with decorators to describe metadata
and action mappings. To define a state container, let's create an
ES2015 class and decorate it with the `State` decorator.

```TS
import { State } from '@ngxs/store';

@State<string[]>({
  name: 'animals',
  defaults: []
})
export class AnimalsState {}
```

In the state decorator, we define some metadata about the state. These options
include:

- `name`: The name of the state slice. Note: The name is a required parameter and must be unique for the entire application.
Names must be object property safe, (e.g. no dashes, dots, etc).
- `defaults`: Default set of object/array for this state slice.
- `children`: Child sub state associations.

Our states can also participate in dependency injection. This is hooked up automatically
so all you need to do is inject your dependencies in the constructor.

```TS
@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    feed: false
  }
})
export class ZooState {
  constructor(private zooService: ZooService) {}
}
```

## Defining Actions
Our states listen to actions via an `@Action` decorator. The action decorator
accepts an action class or an array of action classes.

### Simple Actions
Let's define a state that will listen to a `FeedAnimals` action to toggle whether the animals have been fed:

```TS
import { State, Action, StateContext } from '@ngxs/store';

export class FeedAnimals {
  static readonly type = '[Zoo] FeedAnimals';
}

export interface ZooStateModel {
  feed: boolean;
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    feed: false
  }
})
export class ZooState {
  @Action(FeedAnimals)
  feedAnimals(ctx: StateContext<ZooStateModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      feed: !state.feed
    });
  }
}
```

The `feedAnimals` function has one argument called `ctx` with a type of `StateContext<ZooStateModel>`. This
context state has a slice pointer and a function exposed to set the state. It's important
to note that the `getState()` method will always return
the freshest state slice from the global store each time it is accessed. This
ensures that when we're performing async operations the state
is always fresh. If you want a snapshot, you can always clone the state
in the method.

### Actions with a payload
Actions can also pass along metadata that has to do with the action.
Say we want to pass along how much hay and carrots each zebra needs.

```TS
import { State, Action, StateContext } from '@ngxs/store';

// This is an interface that is part of your domain model
export interface ZebraFood {
  name: string;
  hay: number;
  carrots: number;
}

// naming your action metadata explicitly makes it easier to understand what the action
// is for and makes debugging easier.
export class FeedZebra {
  static readonly type = '[Zoo] FeedZebra';
  constructor(public zebraToFeed: ZebraFood) {}
}

export interface ZooStateModel {
  zebraFood: ZebraFood[];
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    zebraFood: []
  }
})
export class ZooState {
  @Action(FeedZebra)
  feedZebra(ctx: StateContext<ZooStateModel>, action: FeedZebra) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      zebraFood: [
        ...state.zebraFood,
        // this is the new ZebraFood instance that we add to the state
        action.zebraToFeed,
      ]
    });
  }
}
```

In this example, we have a second argument that represents the action and we destructure it
to pull out the name, hay, and carrots which we then update the state with.

There is also a shortcut `patchState` function to make updating the state easier. In this case,
you only pass it the properties you want to update on the state and it handles the rest.
The above function could be reduced to this:

```TS
@Action(FeedZebra)
feedZebra(ctx: StateContext<ZooStateModel>, action: FeedZebra) {
  const state = ctx.getState();
  ctx.patchState({
    zebraFood: [
      ...state.zebraFood,
      action.zebraToFeed,
    ]
  });
}
```

The `setState` function can also be called with a function which will be given the
existing state and should return the new state.
All immutability concerns need to be honoured by this function.

For comparison, here are the two ways that you can invoke the `setState` function...  
With a new constructed state value:
```TS
@Action(MyAction)
public addValue(ctx: StateContext, { payload }: MyAction) {
  ctx.setState({ ...ctx.getState(), value: payload  });
}
```
With a function that returns the new state value:
```TS
@Action(MyAction)
public addValue(ctx: StateContext, { payload }: MyAction) {
  ctx.setState((state) => ({ ...state, value: payload }));
}
```

You may ask _"How is this valuable?"_. Well, it opens the door for refactoring of your immutable updates into `state operators` so that your code can become more declarative as opposed to imperative. We will be adding some standard `state operators` soon that you will be able to use to express your updates to the state. Follow the issue here for updates: https://github.com/ngxs/store/issues/545

As another example you could use a library like [immer](https://github.com/mweststrate/immer) that can
handle the immutability updates for you and provide a different way of expressing your immutable update
through direct mutation of a draft object. We can use this external library because it supports the same signature as out `state operators` through their curried `produce` function. Here is the example from above expressed in this way:
```TS
import produce from 'immer';

// in class ZooState ...
@Action(FeedZebra)
feedZebra(ctx: StateContext<ZooStateModel>, action: FeedZebra) {
  ctx.setState(produce((draft) => {
    draft.zebraFood.push(action.zebraToFeed);
  }));  
}
```
Here the `produce` function from the `immer` library is called with just a single parameter 
so that it returns its' [curried form](https://github.com/mweststrate/immer#currying) 
that will take a value and return a new value with all the expressed changes applied.

This approach can also allow for the creation of well named helper functions that can be shared 
between handlers that require the same type of update. 
The above example could be refactored to this:
```TS
// in class ZooState ...
@Action(FeedZebra)
feedZebra(ctx: StateContext<ZooStateModel>, action: FeedZebra) {
  ctx.setState(addToZebraFood(action.zebraToFeed));
}

// defined elsewhere
import produce from 'immer';

function addToZebraFood(itemToAdd) {
  return produce((draft) => {
    draft.zebraFood.push(itemToAdd);
  });
}
```

### Async Actions
Actions can perform async operations and update the state after an operation.

Typically in Redux your actions are pure functions and you have some other system like a saga or an effect to perform
these operations and dispatch another action back to your state to mutate it. There are some
reasons for this, but for the most part it can be redundant and just add boilerplate. The great thing here is
we give you the flexibility to make that decision yourself based on your requirements.

Let's take a look at a simple async action:

```TS
import { State, Action, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';

export class FeedAnimals {
  static readonly type = '[Zoo] FeedAnimals';
  constructor(public animalsToFeed: string) {}
}

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    feedAnimals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FeedAnimals)
  feedAnimals(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    return this.animalService.feed(action.animalsToFeed).pipe(
      tap(animalsToFeedResult => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          feedAnimals: [...state.feedAnimals, animalsToFeedResult]
        });
      })
    );
  }
}
```

In this example, we reach out to the animal service and call `feed` and then
call `setState` with the result. Remember that we can guarantee that the state
is fresh since the state property is a getter back to the current state slice.

You might notice I returned the Observable and just did a `tap`. If we return
the Observable, the framework will automatically subscribe to it for us, so
we don't have to deal with that ourselves. Additionally, if we want the stores
`dispatch` function to be able to complete only once the operation is completed,
we need to return that so it knows that.

Observables are not a requirement, you can use promises too. We could swap
that observable chain to look like this:

```TS
import { State, Action } from '@ngxs/store';

export class FeedAnimals {
  static readonly type = '[Zoo] FeedAnimals';
  constructor(public animalsToFeed: string) {}
}

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    feedAnimals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FeedAnimals)
  async feedAnimals(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    const result = await this.animalService.feed(action.animalsToFeed);
    const state = ctx.getState();
    ctx.setState({
      ...state,
      feedAnimals: [...state.feedAnimals, result]
    });
  }
}
```

### Dispatching Actions From Actions
If you want your action to dispatch another action, you can use the `dispatch` function
that is contained in the state context object.


```TS
import { State, Action, StateContext } from '@ngxs/store';
import { map } from 'rxjs/operators';

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    feedAnimals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService) {}

  /**
   * Simple Example
   */
  @Action(FeedAnimals)
  feedAnimals(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      feedAnimals: [...state.feedAnimals, action.animalsToFeed]
    });

    return ctx.dispatch(new TakeAnimalsOutside());
  }

  /**
   * Async Example
   */
  @Action(FeedAnimals)
  feedAnimals2(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    return this.animalService.feed(action.animalsToFeed).pipe(
      tap(animalsToFeedResult => {
        const state = ctx.getState();
        ctx.patchState({
          feedAnimals: [...state.feedAnimals, animalsToFeedResult]
        });
      }),
      mergeMap(() => ctx.dispatch(new TakeAnimalsOutside()))
    );
  }
}
```

Notice I returned the dispatch function, this goes back to our example above with async operations
and the dispatcher subscribing to the result. It is not required though.
