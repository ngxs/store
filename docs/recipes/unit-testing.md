# Unit Testing

Unit testing is easy with NGXS. To perform a unit test we just dispatch the events, listen to the changes and
perform our expectation. A basic test looks like this:

```ts
import { TestBed } from '@angular/core/testing';

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

    const feed = store.selectSnapshot(state => state.zoo.feed);
    expect(feed).toBe(true);
  });
});
```

We recommend using `selectSnapshot` method instead of `selectOnce` or `select`. Jasmine and Jest might not run expectations inside the `subscribe` block. Given the following example:

```ts
it('should select zoo', () => {
  store
    .selectOnce(state => state.zoo)
    .subscribe(zoo => {
      // Note: this expectation will not be run!
      expect(zoo).toBeTruthy();
    });

  const zoo = store.selectSnapshot(state => state.zoo);
  expect(zoo).toBeTruthy();
});
```

## Prepping State

Often times in your app you want to test what happens when the state is C and you dispatch action X. You
can use the `store.reset(MyNewState)` to prepare the state for your next operation.

Note: You need to provide the registered state name as key if you reset the state. `store.reset` will reflect to your whole state! Merge the current with your new changes to be sure nothing gets lost.

```ts
// zoo.state.spec.ts
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

    const feed = store.selectSnapshot(state => state.zoo.feed);
    expect(feed).toBe(true);
  });
});
```

## Testing Selectors

Selectors are just plain functions that accept the state as the argument
so its really easy to test them. A simple test might look like this:

```ts
import { TestBed } from '@angular/core/testing';

describe('Zoo', () => {
  it('it should select pandas', () => {
    const pandas = store.selectSnapshot(Zoo.pandas);
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

Testing these selectors is really an easy task.
You just need to mock the state and pass it as parameter to our selector:

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

It's also very easy to test asynchronous actions using Jasmine or Jest. The greatest features of these testing frameworks is a support of `async/await`. No one prevents you of using `async/await` + RxJS `firstValueFrom` method that "converts" `Observable` to `Promise`. As an alternative you could have a `done` callback, Jasmine or Jest will wait until the `done` callback is called before finishing the test.

The below example is not really complex, but it clearly shows how to test asynchronous code using `async/await`:

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
    imports: [NgxsModule.forRoot([CounterState])]
  });

  const store: Store = TestBed.inject(Store);

  await firstValueFrom(store.dispatch(new IncrementAsync()));

  const counter = store.selectSnapshot(CounterState);
  expect(counter).toBe(0);
});
```
