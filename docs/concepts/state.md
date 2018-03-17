# State
States are classes that define a state container.

## Defining a State
States are classes along with decorators to describe metadata
and action mappings. To define a state container, let's create a
ES2015 class and decorator it with the `State` decorator.

```TS
import { State } from 'ngxs';

@State<string[]>({
  name: 'animals',
  defaults: []
})
export class AnimalsState {}
```

In the state decorator, we define some metadata about the state. These options
include:

- `name`: The name of the state slice. If not provided it will 
  infer the name based on the state class signature removing the `State` suffix.
- `defaults`: Default set of object/array for this state slice.
- `children`: Child sub state associations. 

## Defining Actions
Our states listen to actions via a `@Action` decorator. The action decorator
accepts a action class or an array of action classes. 

### Simple Actions
Let's define a state that will listen to a `FeedAction` to toggle whether the animals have been feed:

```TS
import { State, Action } from 'ngxs';

export interface ZooStateModel {
  feed: boolean;
}

@State<ZooStateModel>({
  defaults: {
    feed: false
  }
})
export class ZooState {
  @Action(FeedAnimals)
  feedAnimals({ state, setState }: StateContext<ZooStateModel>) {
    setState({
      ...state,
      feed: !state.feed
    });
  }
}
```

The `feedAnimals` function has one argument called `StateContext`. This
context state slice pointer and a function to set the state. It's important
to note that the `state` property is a getter that will always return
the freshest state slice from the global store each time it is accessed. This
ensures if you are performing async operations you can ensure the state
is always fresh. If you want a snapshot, you can always clone the state
in the method.

### Actions with Payload
This action was simple, it had no payload. Let's take that same concept of
feeding animals and enhance it to accept a payload of the animal name
that has been feed.

```TS
import { State, Action } from 'ngxs';

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
  defaults: {
    feedAnimals: []
  }
})
export class ZooState {
  @Action(FeedAnimals)
  feedAnimals({ state, setState }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    setState({
      ...state,
      feedAnimals: [ ...state.feedAnimals, payload ]
    });
  }
}
```

In this example, we have a second argument that represents the action and we destructure it
to pull out the payload and use it in our action.

### Async Actions
Actions can perform async operations and update the state after a operation. 

Typically in Redux your actions are pure functions and you have some other system like a saga or effect to perform
these operations and dispatch another action back to your state to mutate the state. There are some
reasons why but for the most part it can be redundant and just add boilerplate. The great thing here is
we give you the flexibility to make that decision yourself based on your requirements.

Let's take a look at a simple async action:

```TS
import { State, Action } from 'ngxs';
import { tap } from 'rxjs/operators';

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
  defaults: {
    feedAnimals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FeedAnimals)
  feedAnimals({ state, setState }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    return this.animalService.feed(payload).pipe(tap(result) => {
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
import { State, Action } from 'ngxs';
import { tap } from 'rxjs/operators';

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
  defaults: {
    feedAnimals: []
  }
})
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FeedAnimals)
  async feedAnimals({ state, setState }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    const result = await this.animalService.feed(payload);
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
import { State, Action } from 'ngxs';
import { map } from 'rxjs/operators';

export interface ZooStateModel {
  feedAnimals: string[];
}

@State<ZooStateModel>({
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
  feedAnimals({ state, setState, dispatch }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
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
  feedAnimals2({ state, setState, dispatch }: StateContext<ZooStateModel>, { payload }: FeedAnimals) {
    return this.animalService.feed(payload).pipe(map() => dispatch(TakeAnimalsOutside));
  }
}
```

Notice I returned the dispatch function, this goes back to our example above with async operations
and the dispatcher subscribing to the result. It is not required though.
