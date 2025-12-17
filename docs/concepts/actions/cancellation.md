# Canceling

If you have an async action, you may want to cancel a previous Observable if the action has been dispatched again.
This is useful for canceling previous requests like in a typeahead.

## Basic

For basic scenarios, we can use the `cancelUncompleted` action decorator option.

```ts
import { Injectable } from '@angular/core';
import { State, Action } from '@ngxs/store';

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
@Injectable()
export class ZooState {
  constructor(private animalService: AnimalService, private actions$: Actions) {}

  @Action(FeedAnimals, { cancelUncompleted: true })
  get(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    return this.animalService.get(action.payload).pipe(
      tap((res) => ctx.setState(res))
    ));
  }
}
```

## Using AbortSignal

Starting from NGXS v21, the `StateContext` includes an `abortSignal` property that provides a standardized way to handle cancellation of asynchronous operations. This is particularly useful when working with `cancelUncompleted` actions.

### Why AbortSignal?

The `AbortSignal` provides a standard browser API to detect and respond to cancellations. When an action marked with `cancelUncompleted: true` is canceled (because a new instance was dispatched), the `abortSignal` will be aborted, allowing you to:

- Check cancellation status in async/await code
- Pass the signal to fetch requests for automatic cancellation
- Clean up resources gracefully
- Avoid unnecessary state updates

### With Async/Await

When using async/await, check `ctx.abortSignal.aborted` after await points to handle cancellation:

```ts
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';

export class FetchAnimals {
  static readonly type = '[Zoo] Fetch Animals';
}

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
@Injectable()
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FetchAnimals, { cancelUncompleted: true })
  async fetchAnimals(ctx: StateContext<ZooStateModel>) {
    // Perform async work
    const animals = await this.animalService.getAnimals();

    // Check if canceled before updating state
    if (ctx.abortSignal.aborted) {
      console.log('Action was canceled, skipping state update');
      return;
    }

    ctx.setState({ animals });
  }
}
```

### With Fetch API

The `AbortSignal` works seamlessly with the Fetch API:

```ts
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';

export class SearchAnimals {
  static readonly type = '[Zoo] Search Animals';
  constructor(public query: string) {}
}

@State<ZooStateModel>({
  defaults: {
    animals: [],
    loading: false
  }
})
@Injectable()
export class ZooState {
  @Action(SearchAnimals, { cancelUncompleted: true })
  async searchAnimals(ctx: StateContext<ZooStateModel>, action: SearchAnimals) {
    ctx.patchState({ loading: true });

    try {
      // Pass the abort signal directly to fetch
      const response = await fetch(`/api/animals?q=${action.query}`, {
        signal: ctx.abortSignal
      });

      const animals = await response.json();
      ctx.patchState({ animals, loading: false });
    } catch (error) {
      // Handle abort gracefully
      if (error.name === 'AbortError') {
        console.log('Search was canceled');
        return; // Don't update state or rethrow
      }

      // Handle other errors
      ctx.patchState({ loading: false });
      throw error;
    }
  }
}
```

### With Observables

When you return an Observable from an action handler, NGXS automatically unsubscribes when the `abortSignal` is aborted. You don't need to manually check the signal:

```ts
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
@Injectable()
export class ZooState {
  constructor(private animalService: AnimalService) {}

  @Action(FeedAnimals, { cancelUncompleted: true })
  feedAnimals(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    // Observable will be automatically unsubscribed if action is canceled
    return this.animalService
      .get(action.payload)
      .pipe(tap(animals => ctx.setState({ animals })));
  }
}
```

## Advanced

For more advanced cases, we can use normal Rx operators.

```ts
import { Injectable } from '@angular/core';
import { State, Action, Actions, ofAction } from '@ngxs/store';
import { tap } from 'rxjs';

@State<ZooStateModel>({
  defaults: {
    animals: []
  }
})
@Injectable()
export class ZooState {
  constructor(private animalService: AnimalService, private actions$: Actions) {}

  @Action(FeedAnimals)
  get(ctx: StateContext<ZooStateModel>, action: FeedAnimals) {
    return this.animalService.get(action.payload).pipe(
      tap((res) => ctx.setState(res)),
      takeUntil(this.actions$.pipe(ofAction(RemoveTodo)))
    ));
  }
}
```
