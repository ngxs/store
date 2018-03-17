# Actions
Actions is a set of instructions for what we want to do along with payload data
associated to it.

## Simple Action
Let's say we want to update the status of whether the animals have been feed
in our Zoo. We would describe a class like:

```TS
export class FeedAnimals {}
```

Later in our state container, we will listen to this action and mutate our
state, in this case flipping a boolean flag.

Now you might notice, I didn't describe a type property on this like
Redux or NGRX requires. That is because with NGXS we use the class signature
eliminating the need for types at all.

## Actions with Data
Often you need an action to have some data associated with it. Let's take that
original `FeedAnimals` action and modify it to have which animal we have feed
by adding a payload member like:

```TS
export class FeedAnimals {
  constructor(public payload: string) {}
}
```

The `payload` object will represent the name of the animal we are feeding.
You don't have to describe your data as `payload` but for consistency practices
we like to follow the [FSA Standard](https://github.com/redux-utilities/flux-standard-action).

## Dispatching Actions
See [Store](store.md) documentation for how to dispatch actions.
