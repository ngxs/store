# Immutability Helpers

Redux is a tiny pattern that represents states as immutable objects. Redux was originally designed for React. Most Redux concepts, such as pure functions, are centered around the React ecosystem. Nowadays Redux is not directly related to React.

The cornerstone of Redux is immutability. Immutabilty is an amazing pattern to minimise unpredictable behaviour in our code. We're not going to cover functional programming in this article. However we're going to look at very useful packages that are called "immutability helpers". Most developers have to deal with, so called, "deep objects" and most important follow the immutability concept, when it comes to changing the value of some deeply nested property.

## immer

`immer` is the most popular library that allows you to work with immutable objects in a more convenient way. Given the following code:

```ts
export interface Task {
  id: number;
  title: string;
  dates: {
    startDate: string;
    dueDate: string;
  };
}

export interface TrelloStateModel {
  tasks: {
    [taskId: string]: Task;
  };
}

@State<TrelloStateModel>({
  name: 'trello',
  defaults: {
    tasks: {}
  }
})
export class TrelloState {}
```

Let's imagine that we're faced with the task of changing the `dueDate` property:

```ts
export class UpdateDueDate {
  static readonly type = '[Trello] Update due date';
  constructor(public taskId: string, public dueDate: string) {}
}
```

Let's see how we would implement the `updateDueDate` action handler:

```ts
export class TrelloState {

  @Action(UpdateDueDate)
  updateDueDate(ctx: StateContext<TrelloStateModel>, action: UpdateDueDate) {
    ctx.setState(state => ({
      tasks: {
        ...state.tasks,
        [action.taskId]: {
          ...state.tasks[action.taskId],
          dates: {
            ...state.tasks[action.taskId].dates,
            dueDate: action.dueDate
          }
        }
      }
    }));
  }

}
```

Such code is complicated to maintain and accompany. It's not self-descriptive and will be a problem for upcoming developers. Let's see how we could re-write this code with the help of `immer`:

```ts
import { produce } from 'immer';

export class TrelloState {

  @Action(UpdateDueDate)
  updateDueDate(ctx: StateContext<TrelloStateModel>, action: UpdateDueDate) {
    const state = produce(ctx.getState(), draft => {
      draft.tasks[action.taskId].dates.dueDate = action.dueDate;
    });

    ctx.setState(state);
  }

}
```

Oh, have you noticed it's less code and looks much better. From the `immer` repisitory:
> Using Immer is like having a personal assistant; he takes a letter (the current state) and gives you a copy (draft) to jot changes onto. Once you are done, the assistant will take your draft and produce the real immutable, final letter for you (the next state).

[Immer repository](https://github.com/immerjs/immer)


## object-path-immutable

`object-path-immutable` is a small library that allows you to modify deep object properties without modifying the original object. Let's look at how we could write the same code using this library:

```ts
import immutable from 'object-path-immutable';

export class TrelloState {

  @Action(UpdateDueDate)
  updateDueDate(ctx: StateContext<TrelloStateModel>, action: UpdateDueDate) {
    const state = immutable.set(
      ctx.getState(),
      `tasks.${action.taskId}.dates.dueDate`,
      action.dueDate
    );

    ctx.setState(state);
  }

}
```

[object-path-immutable repository](https://github.com/mariocasciaro/object-path-immutable)

## immutable-assign

`immutable-assign` is a lightweight library that pursues the same goal. Its syntax is alike to `immer`'s:

```ts
import * as iassign from 'immutable-assign';

export class TrelloState {

  @Action(UpdateDueDate)
  updateDueDate(ctx: StateContext<TrelloStateModel>, action: UpdateDueDate) {
    const state = iassign(ctx.getState(), state => {
      state.tasks[action.taskId].dates.dueDate = action.dueDate;
      return state;
    });

    ctx.setState(state);
  }

}
```

[immutable-assign repository](https://github.com/engineforce/ImmutableAssign)

## Ramda

Ramda is an adorable library for functional programming and it's used in a large number of projects. This example might be useful for people who use both Ramda and NGXS in their projects:

```ts
import * as R from 'ramda';

export class TrelloState {

  @Action(UpdateDueDate)
  updateDueDate(ctx: StateContext<TrelloStateModel>, action: UpdateDueDate) {
    const property = R.lensPath(['tasks', action.taskId, 'dates', 'dueDate']);
    const state = R.set(property, action.dueDate, ctx.getState());
    ctx.setState(state);
  }

}
```

[Ramda repository](https://github.com/ramda/ramda)

## icepick

`icepick` is a zero-dependency library for working with immutable collections. Given the following re-written code:

```ts
import * as icepick from 'icepick';

export class TrelloState {

  @Action(UpdateDueDate)
  updateDueDate(ctx: StateContext<TrelloStateModel>, action: UpdateDueDate) {
    const state = icepick.setIn(
      ctx.getState(),
      ['tasks', action.taskId, 'dates', 'dueDate'],
      action.dueDate
    );

    ctx.setState(state);
  }

}
```

[icepick repository](https://github.com/aearly/icepick)

## Summary

We have looked at several different libraries that might be helpful in accompanying the concept of immutability. Choose the right one for your needs.
