# Actions
Actions can either be thought of as a command which should trigger something to happen,
or as the resulting event of something that has already happened.

Each action contains a `type` field which is their unique identifier.

## Internal Actions
There are two actions that gets triggered in the internals of the library:

1. @@INIT - store being initialized, before all the [ngxsOnInit Life-cycle](../advanced/life-cycle.md) events.
1. @@UPDATE_STATE - a new [lazy-loaded state](../advanced/lazy.md) being added to the store.

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
They are usually triggered by user events such as clicking on a button, or selecting something.

Names should contain three parts:

* A context as to where the command came from, `[User API]`, `[Product Page]`, `[Dashboard Page]`.
* A verb describing what we want to do with the entity.
* The entity we are acting upon, `User`, `Card`, `Project`.

Examples:

* `[User API] GetUser`
* `[Product Page] AddItemToCart`
* `[Dashboard Page] ArchiveProject`

### Event examples
Events are actions that have already happened and we now need to react to them.

The same naming conventions apply as commands, but they should always be in the past tense.

By using `API` in the context part of the action name we know that this event was fired because of an async action to an API.

Actions are normally dispatched from container components such as router pages.
By having explicit actions for each page, it's also easier to track where an event came from.

Examples:

* [User API] GetUserSuccess
* [Project API] ProjectUpdateFailed
* [User Details Page] PasswordChanged
* [Project Stars Component] StarsUpdated

A great video on the topic is [Good Action Hygiene by Mike Ryan](https://www.youtube.com/watch?v=JmnsEvoy-gY)
It's for NgRx, but the same naming conventions apply to NGXS.

## Group your actions
Currently we suffix 'Action' with each action class name like:

```TS
export class AddAction {
  static readonly type = '[Todo] Add';
  constructor(public payload: any) { }
}

export class EditAction {
  static readonly type = '[Todo] Edit';
  constructor(public payload: any) { }
}

export class FetchAllAction {
  static readonly type = '[Todo] Fetch All'
}

export class DeleteAction {
  static readonly type = '[Todo] Delete';
  constructor(public id: number) { }
}

```

here we just add 'Action' with namespace, so we can group similar action.
In this case just import namespace instead of multiple action class in same file.

```TS
export namespace TodoAction {

  export class Add {
    static readonly type = '[Todo] Add';
    constructor(public payload: any) { }
  }

  export class Edit {
    static readonly type = '[Todo] Edit';
    constructor(public payload: any) { }
  }

  export class FetchAll {
    static readonly type = '[Todo] Fetch All'
  }

  export class Delete {
    static readonly type = '[Todo] Delete';
    constructor(public id: number) { }
  }
}
```
