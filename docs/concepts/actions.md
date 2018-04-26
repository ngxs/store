# Actions
Actions can either be thought of as a command which should trigger something to happen,
or as the resulting event of something that has already happened.

Each action contains a `type` field which is their unique identifier.

## Simple Action
Let's say we want to update the status of whether the animals have been fed
in our Zoo. We would describe a class like:

```TS
export class FeedAnimals {
  static readonly type = '[Zoo] Feed Animals';
}
```

Later in our state class, we will listen to this action and mutate our
state, in this case flipping a boolean flag.

## Actions with Metadata
Often you need an action to have some data associated with it.
Here we have an action that should trigger feeding a zebra with hay.

```TS
export class FeedZebra {
  static readonly type = '[Zoo] Feed Zebra';
  constructor(public name: string, public hayAmount: number) {}
}
```

The `name` field of the action class will represent the name of the zebra we should feed.
The `hayAmount` tells us how many kilos of hay the zebra should get.

## Dispatching Actions
See [Store](store.md) documentation for how to dispatch actions.

## How should you name your actions?

### Commands
Commands are actions that tell your app to do something.
They are usually trigged by user events such as clicking on a button, or selecting something.

Names should contain three parts:

* A context as to where the command came from, '[User API]', '[Product Page]', '[Dashboard Page]`.
* The entity we are acting upon, `User`, `Card`, `ArchiveProject`.
* A verb describing what we want to do with the entity.

Examples:

* [User API] GetUser
* [Product Page] AddItemToCart
* [Dashboard Page] ArchiveProject

### Event examples
Events are actions that have already happended and we now need to react to them.

The same naming conventions apply as to command, but they should always be in past tense.

By using `API` in the context part we now that this event was fired because of a async action to an API.

Actions are normally dispatched from container components such as router pages.
By having explicit actions for each page, it's also easier to track where an event came from.

Examples:

* [User API] GetUserSuccess
* [Project API] ProjectUpdateFailed
* [User Details Page] PasswordChanged
* [Project Stars Component] StarsUpdated

A great video on the topic is [Good Action Hygiene by Mike Ryan](https://www.youtube.com/watch?v=JmnsEvoy-gY)
It's for NGRX, but the same naming convensions apply to NGXS.
