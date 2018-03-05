# Mutation
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

The `Mutation` decorator can also take multiple events, so you could do:

```javascript
@Mutation([FeedAnimals, WaterAnimals])
```
