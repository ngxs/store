# Unit Testing

Unit testing NGXS states is similar to testing other services. To perform a unit test, we need to set up a store with the states against which we want to make assertions. Then, we dispatch actions, listen to changes, and perform expectations.

A basic test looks as follows:

```ts
// zoo.state.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';

import { ZooState } from './zoo.state';
import { FeedAnimals } from './zoo.actions';

describe('Zoo', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([ZooState])]
    });

    store = TestBed.inject(Store);
  });

  it('it toggles feed', () => {
    store.dispatch(new FeedAnimals());

    const feed = store.selectSnapshot(ZooState.getFeed);
    expect(feed).toBe(true);
  });
});
```

We recommend using the `selectSnapshot` or `selectSignal` methods instead of `select` or `selectOnce`, because it would require calling a `done` function manually. This actually depends on whether states are updated synchronously or asynchronously. If states are updated synchronously, then `selectOnce` would always emit updated state synchronously.

> 💡 `selectSnapshot` may behave similarly to `selectSignal`, but it would be more readable because you don't need to call the signal function to get the value.

Given the following example:

```ts
it('should select feed', () => {
  store.selectOnce(ZooState.getFeed).subscribe(feed => {
    expect(feed).toBeTruthy();
  });

  const feed = store.selectSnapshot(ZooState.getFeed);
  expect(feed).toBeTruthy();
});
```

If you're using Jest, you may use [`expect.assertions`](https://jestjs.io/docs/expect#expectassertionsnumber) to let Jest know that a certain amount of assertions must run within the test:

```ts
it('should select feed', () => {
  expect.assertions(1);

  store.selectOnce(ZooState.getFeed).subscribe(feed => {
    expect(feed).toBeTruthy();
  });
});
```

The above test would fail if the expectation within the subscribe function isn't run once.

## Prepping State

Often in your app, you'll need to test what happens when the state is C and you dispatch action X. You can use `store.reset(MyNewState)` to prepare the state for your next operation.

> ⚠️ When resetting the state, ensure you provide the registered state name as the key. `store.reset` affects your entire state. Merge the current state with your new changes to ensure nothing gets lost.

```ts
import { TestBed } from '@angular/core/testing';

export const SOME_DESIRED_STATE = {
  animals: ['Panda']
};

describe('Zoo', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([ZooState])]
    });

    store = TestBed.inject(Store);
    store.reset({
      ...store.snapshot(),
      zoo: SOME_DESIRED_STATE
    });
  });

  it('it toggles feed', () => {
    store.dispatch(new FeedAnimals());

    const feed = store.selectSnapshot(ZooState.getFeed);
    expect(feed).toBe(true);
  });
});
```

## Testing Selectors

Selectors are simply plain functions that accept the state as an argument, making them easy to test. A simple test might look like this:

```ts
import { TestBed } from '@angular/core/testing';

describe('Zoo', () => {
  it('it should select pandas', () => {
    const pandas = store.selectSnapshot(ZooState.getPandas);
    expect(pandas).toEqual(['pandas']);
  });
});
```

In your application you may have selectors created dynamically using the `createSelector` function:

```ts
export class ZooSelectors {
  static getAnimalNames = (type: string) => {
    return createSelector([ZooState], (state: ZooStateModel) =>
      state.animals.filter(animal => animal.type === type).map(animal => animal.name)
    );
  };
}
```

Testing these selectors is really easy. You just need to mock the state and pass it as a parameter to our selector:

```ts
it('should select requested animal names from state', () => {
  const zooState = {
    animals: [
      { type: 'zebra', name: 'Andy' },
      { type: 'panda', name: 'Betty' },
      { type: 'zebra', name: 'Crystal' },
      { type: 'panda', name: 'Donny' }
    ]
  };

  const value = ZooSelectors.getAnimalNames('zebra')(zooState);

  expect(value).toEqual(['Andy', 'Crystal']);
});
```

## Testing Asynchronous Actions

It's also very easy to test asynchronous actions. You can use `async/await` along with RxJS's `firstValueFrom` method, which "converts" Observables to Promises. Alternatively, you can use a `done` callback.

The example below isn't really complex, but it clearly demonstrates how to test asynchronous code using `async/await`:

```ts
import { timer, tap, mergeMap } from 'rxjs';

it('should wait for completion of the asynchronous action', async () => {
  class IncrementAsync {
    static type = '[Counter] Increment async';
  }

  class DecrementAsync {
    static type = '[Counter] Decrement async';
  }

  // Assume you will make some XHR call to your API or anything else
  function getRandomDelay() {
    return 1000 * Math.random();
  }

  @State({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Selector()
    static getCounter(state: number) {
      return state;
    }

    @Action(IncrementAsync)
    incrementAsync(ctx: StateContext<number>) {
      const delay = getRandomDelay();

      return timer(delay).pipe(
        tap(() => {
          // We're incrementing the state value and setting it
          ctx.setState(state => (state += 1));
        }),
        // After incrementing we want to decrement it again to the zero value
        mergeMap(() => ctx.dispatch(new DecrementAsync()))
      );
    }

    @Action(DecrementAsync)
    decrementAsync(ctx: StateContext<number>) {
      const delay = getRandomDelay();

      return timer(delay).pipe(
        tap(() => {
          ctx.setState(state => (state -= 1));
        })
      );
    }
  }

  TestBed.configureTestingModule({
    providers: [provideStore([CounterState])]
  });

  const store: Store = TestBed.inject(Store);

  await firstValueFrom(store.dispatch(new IncrementAsync()));

  const counter = store.selectSnapshot(CounterState.getCounter);
  expect(counter).toBe(0);
});
```

## Collecting Actions

Below is the code used to collect actions passing through the actions stream:

```ts
import {
  ENVIRONMENT_INITIALIZER,
  inject,
  Injectable,
  makeEnvironmentProviders,
  OnDestroy
} from '@angular/core';
import { Actions, ActionStatus, ActionContext } from '@ngxs/store';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NgxsActionCollector implements OnDestroy {
  private _destroyed$ = new ReplaySubject<void>(1);
  private _stopped$ = new Subject<void>();
  private _started = false;

  readonly dispatched: any[] = [];
  readonly completed: any[] = [];
  readonly successful: any[] = [];
  readonly errored: any[] = [];
  readonly cancelled: any[] = [];

  constructor(private _actions$: Actions) {}

  start() {
    if (this._started) {
      return;
    }
    this._started = true;
    this._actions$.pipe(takeUntil(this._destroyed$), takeUntil(this._stopped$)).subscribe({
      next: (actionCtx: ActionContext) => {
        switch (actionCtx.status) {
          case ActionStatus.Dispatched:
            this.dispatched.push(actionCtx.action);
            break;
          case ActionStatus.Successful:
            this.successful.push(actionCtx.action);
            this.completed.push(actionCtx.action);
            break;
          case ActionStatus.Errored:
            this.errored.push(actionCtx.action);
            this.completed.push(actionCtx.action);
            break;
          case ActionStatus.Canceled:
            this.cancelled.push(actionCtx.action);
            this.completed.push(actionCtx.action);
            break;
          default:
            break;
        }
      },
      complete: () => {
        this._started = false;
      },
      error: () => {
        this._started = false;
      }
    });
  }

  reset() {
    function clearArray(arr: any[]) {
      arr.splice(0, arr.length);
    }
    clearArray(this.dispatched);
    clearArray(this.completed);
    clearArray(this.successful);
    clearArray(this.errored);
    clearArray(this.cancelled);
  }

  stop() {
    this._stopped$.next();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }
}

export function provideNgxsActionCollector() {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(NgxsActionCollector).start()
    }
  ]);
}
```

The actions collector snippet above was created by the NGXS team and has been successfully used in production apps for years. Now, let's examine an example of how to set up the collector and how to use it:

```ts
describe('Zoo', () => {
  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [provideStore([ZooState]), provideNgxsActionCollector()]
    });

    const store = TestBed.inject(Store);
    const actionCollector = TestBed.inject(NgxsActionCollector);
    const actionsDispatched = actionCollector.dispatched;

    return { store, actionsDispatched };
  };

  it('it toggles feed', () => {
    const { store, actionsDispatched } = testSetup();

    store.dispatch(new FeedAnimals());

    expect(actionsDispatched.some(action => action instanceof FeedAnimals)).toBeTruthy();
  });
});
```

When using [Jest's `expect.extend`](https://jestjs.io/docs/expect#expectextendmatchers), we can even add our custom matcher to Jest for assertions against dispatched actions:

```ts
// src/matchers.ts
expect.extend({
  toHaveBeenDispatched(expected: any | any[], actionCollector: NgxsActionCollector) {
    if (!actionCollector) {
      return {
        pass: false,
        message: () => `actionCollector is ${actionCollector}.`
      };
    }

    const verifyActionFn = (expectedAction: any) => {
      return actionCollector.dispatched.some(
        actionDispatched =>
          expectedAction.constructor === actionDispatched.constructor &&
          this.equals(actionDispatched, expectedAction)
      );
    };
    const actionsToCheck = Array.isArray(expected) ? expected : [expected];
    const notDispatchedActions = actionsToCheck.filter(
      (expectedAction: any) => !verifyActionFn(expectedAction)
    );

    return {
      pass: notDispatchedActions.length === 0,
      message: () =>
        `Actions:` +
        notDispatchedActions.map(
          action => `\n${action?.constructor?.name} ${this.utils.stringify(action)}`
        ) +
        `\nnot found among dispatched actions.`
    };
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenDispatched(actionCollector: NgxsActionCollector): boolean;
    }
  }
}
```

To make that matcher available in your unit tests, you can provide it in [`setupFilesAfterEnv`](https://jestjs.io/docs/configuration#setupfilesafterenv-array):

```ts
// jest.config.ts
export default {
  // Some other configuration options...
  setupFilesAfterEnv: ['<rootDir>/src/matchers.ts']
};
```

Here's a simple example of how to use that matcher:

```ts
describe('Zoo', () => {
  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [provideStore([ZooState]), provideNgxsActionCollector()]
    });

    const store = TestBed.inject(Store);
    const actionCollector = TestBed.inject(NgxsActionCollector);

    return { store, actionCollector };
  };

  it('it should get animals and dispatch success action', async () => {
    const { store, actionCollector } = testSetup();

    await firstValueFrom(store.dispatch(new GetAnimals()));

    // Consider `GetAnimalsSuccess` as an action dispatched within
    // the `GetAnimals` action handler after animals have been
    // successfully loaded:
    // return someService.getAnimals().pipe(
    //   tap(() => ctx.dispatch(new GetAnimalsSuccess()))
    // )
    expect(new GetAnimalsSuccess()).toHaveBeenDispatched(actionCollector);
  });
});
```
