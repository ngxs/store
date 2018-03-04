# Action
Mutations should not reach out to backend services or do async operations.
Those are reserved for `Action`. Similarly actions should not mutate state.
Lets say for our `NewAnimal` event we want to reach out to the backend and save the
new animal before we add it to the UI.

Our stores can also participate in dependency injection so when we want to 
reach out to our backend injectable service, we can just inject it. When 
using DI, its important to add your store to your module's providers.
The arguments of the function are similar to those of the mutation, passing 
the state and the action. Lets see what this looks like:

```javascript
import { Store, Action } from 'ngxs';

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
    resolve(new AnimalSuccess());
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
