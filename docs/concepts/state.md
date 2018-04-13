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
Names must be object property safe, AKA no dashes, dots, etc.
- `defaults`: Default set of object/array for this state slice.
- `children`: Child sub state associations.

Our states can also participate in dependency injection, this is hooked up automatically
so all you need to do is inject your dependencies such as services in the constructor.

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
Our states listen to actions via a `@Action` decorator. The action decorator
accepts an action class or an array of action classes. 

### Simple Actions
Let's define a state that will listen to a `FeedAnimals` action to toggle whether the animals have been feed:

```TS
import { State, Action, StateContext } from '@ngxs/store';

export interface ZooStateModel {
  feed: boolean;
}

@State<ZooStateModel>({
  name: 'zoo'
  defaults: {
    feed: false
  }
})
export class ZooState {
  @Action(FeedAnimals)
  feedAnimals({ getState, setState }: StateContext<ZooStateModel>) {
    const state = getState();
    setState({
      ...state,
      feed: !state.feed
    });
  }
}
```

The `feedAnimals` function has one argument called `StateContext`. This
context state has a slice pointer and a function to set the state. It's important
to note that the `state` property is a getter that will always return
the freshest state slice from the global store each time it is accessed. This
ensures that when we're performing async operations the state
is always fresh. If you want a snapshot, you can always clone the state
in the method.

### Actions with Payload
This action was simple, it had no payload. Let's take that same concept of
feeding animals and enhance it to accept a payload of the animal name
that has been fed.

```TS
import { State, Action, StateContext } from '@ngxs/store';

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
  @Action(FeedAnimals)
  feedAnimals({ getState, setState }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    const state = getState();
    setState({
      ...state,
      feedAnimals: [ ...state.feedAnimals, payload ]
    });
  }
}
```

In this example, we have a second argument that represents the action and we destructure it
to pull out the payload and use it in our action.

There is also a shortcut `patchState` function to make updating the state easier. In this case,
you only pass it the properties you want to update on the state and it handles the rest. The above function
could be reduced to this:

```TS
@Action(FeedAnimals)
  feedAnimals({ getState, patchState }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
  const state = getState();
  patchState({
    feedAnimals: [ ...state.feedAnimals, payload ]
  });
}
```

### Async Actions
Actions can perform async operations and update the state after an operation. 

Typically in Redux your actions are pure functions and you have some other system like a saga or an effect to perform
these operations and dispatch another action back to your state to mutate the state. There are some
reasons why, but for the most part it can be redundant and just add boilerplate. The great thing here is
we give you the flexibility to make that decision yourself based on your requirements.

Let's take a look at a simple async action:

```TS
import { State, Action, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';

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
  feedAnimals({ getState, setState }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    return this.animalService.feed(payload).pipe(tap(result) => {
      const state = getState();
      setState({
        ...state,
        feedAnimals: [ ...state.feedAnimals, result ]
      });
    });
  }
}
```

In this example, we reach out to the animal service and call `feed` and then
call `setState` with the result. Remember that we can guarantee that the state
is fresh since the state property is a getter back to the current state slice.

You might notice I returned the observable and just did a `tap`. If we return
the observable, the framework will automatically subscribe to it for us, so
we don't have to deal with that ourselves. Additionally, if we want the store's
`dispatch` function to be able to complete only once the operation is completed,
we need to return that so it knows that.

Observables are not a requirement, you can use promises too. We could swap
that observable chain to look like this:

```TS
import { State, Action } from '@ngxs/store';

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
  name: 'zoo'
  defaults: {
    feedAnimals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FeedAnimals)
  async feedAnimals({ getState, setState }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    const result = await this.animalService.feed(payload);
    const state = getState();
    setState({
      ...state,
      feedAnimals: [ ...state.feedAnimals, result ]
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
  feedAnimals({ getState, setState, dispatch }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    const state = getState();
    setState({
      ...state,
      feedAnimals: [ ...state.feedAnimals, result ]
    });

    return dispatch(TakeAnimalsOutside);
  }

  /**
   * Async Example
   */
  @Action(FeedAnimals)
  feedAnimals2({ dispatch }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    return this.animalService.feed(payload).pipe(map(() => dispatch(TakeAnimalsOutside));
  }
}
```

Notice I returned the dispatch function, this goes back to our example above with async operations
and the dispatcher subscribing to the result. It is not required though.
