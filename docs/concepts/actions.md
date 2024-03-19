# Actions

Actions can either be thought of as a command which should trigger something to happen,
or as the resulting event of something that has already happened.

Each action contains a `type` field which is its unique identifier.

## Installing with schematics

```bash
ng generate @ngxs/store:actions
```

Note: Running this command will prompt you to create an "Action". The options available for the "Action" are listed in the table below.

You have the option to enter the options yourself

```bash
ng generate @ngxs/store:actions --name NAME_OF_YOUR_ACTION
```

| Option | Description                                  | Required | Default Value        |
| :----- | :------------------------------------------- | :------: | :------------------- |
| --name | The name of the actions                      |   Yes    |                      |
| --path | The path to create the actions               |    No    | App's root directory |
| --flat | Boolean flag to indicate if a dir is created |    No    | `false`              |

🪄 **This command will**:

- Create an action with the given options

> Note: If the --flat option is false, the generated files will be organized into a directory named using the kebab case of the --name option. For instance, 'MyActions' will be transformed into 'my-actions'.

## Internal Actions

There are two actions that get triggered in the internals of the library:

1. @@INIT - store being initialized, before all the [ngxsOnInit Life-cycle](../advanced/life-cycle.md) events.
1. @@UPDATE_STATE - a new [lazy-loaded state](../advanced/lazy.md) being added to the store.

## Simple Action

Let's say we want to update the status of whether the animals have been fed
in our Zoo. We would describe a class like:

```ts
export class FeedAnimals {
  static readonly type = '[Zoo] Feed Animals';
}
```

Later in our state class, we will listen to this action and mutate our
state, in this case flipping a boolean flag.

## Actions with Metadata

Often you need an action to have some data associated with it.
Here we have an action that should trigger feeding a zebra with hay.

```ts
export class FeedZebra {
  static readonly type = '[Zoo] Feed Zebra';

  constructor(
    public name: string,
    public hayAmount: number
  ) {}
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

- A context as to where the command came from, `[User API]`, `[Product Page]`, `[Dashboard Page]`.
- A verb describing what we want to do with the entity.
- The entity we are acting upon, `User`, `Card`, `Project`.

Examples:

- `[User API] GetUser`
- `[Product Page] AddItemToCart`
- `[Dashboard Page] ArchiveProject`

### Event examples

Events are actions that have already happened and we now need to react to them.

The same naming conventions apply as commands, but they should always be in the past tense.

By using `API` in the context part of the action name we know that this event was fired because of an async action to an API.

Actions are normally dispatched from container components such as router pages.
By having explicit actions for each page, it's also easier to track where an event came from.

Examples:

- [User API] GetUserSuccess
- [Project API] ProjectUpdateFailed
- [User Details Page] PasswordChanged
- [Project Stars Component] StarsUpdated

A great video on the topic is [Good Action Hygiene by Mike Ryan](https://www.youtube.com/watch?v=JmnsEvoy-gY)
It's for NgRx, but the same naming conventions apply to NGXS.

## Group your actions

Don't suffix your actions:

```ts
export class AddTodo {
  static readonly type = '[Todo] Add';

  constructor(public payload: any) {}
}

export class EditTodo {
  static readonly type = '[Todo] Edit';

  constructor(public payload: any) {}
}

export class FetchAllTodos {
  static readonly type = '[Todo] Fetch All';
}

export class DeleteTodo {
  static readonly type = '[Todo] Delete';

  constructor(public id: number) {}
}
```

here we group similar actions into the `Todo` namespace.
In this case just import namespace instead of multiple action classes in same file.

```ts
const ACTION_SCOPE = '[Todo]';

export namespace TodoActions {
  export class Add {
    static readonly type = `${ACTION_SCOPE} Add`;

    constructor(public payload: any) {}
  }

  export class Edit {
    static readonly type = `${ACTION_SCOPE} Edit`;

    constructor(public payload: any) {}
  }

  export class FetchAll {
    static readonly type = `${ACTION_SCOPE} Fetch All`;
  }

  export class Delete {
    static readonly type = `${ACTION_SCOPE} Delete`;

    constructor(public id: number) {}
  }
}
```
