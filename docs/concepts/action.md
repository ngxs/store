# Actions

## What is an Action?
Let's define what our store is going to do. We call these event classes. They
will be what we dispatch and our stores respond to. For this store, we will define
the following:

```javascript
export class FeedAnimals {}
export class NewAnimal {
  constructor(public payload: string) {}
}
export class NewAnimalSuccess {}
```

In the above events, we have `FeedAnimals` which has no payload for it. It's just
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
