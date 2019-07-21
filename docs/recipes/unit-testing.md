# Unit Testing

Unit testing is easy with NGXS. To perform a unit test we just dispatch the events, listen to the changes and
perform our expectation. A basic test looks like this:

```TS
import { async, TestBed } from '@angular/core/testing';

describe('Zoo', () => {
  let store: Store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ZooState])],
    }).compileComponents();
    store = TestBed.get(Store);
  }));

  it('it toggles feed', () => {
    store.dispatch(new FeedAnimals());
    store.selectOnce(state => state.zoo.feed).subscribe(feed => {
      expect(feed).toBe(true);
    });
  });
});
```

You might notice the use of `selectOnce` rather than just `select`, this is a shortcut
method that allows us to only listen for one emit which is typically what we want
for unit testing.

## Prepping State

Often times in your app you want to test what happens when the state is C and you dispatch action X. You
can use the `store.reset(MyNewState)` to prepare the state for your next operation.


```TS
// zoo.state.spec.ts
import { TestBed, async } from '@angular/core/testing';

export const SOME_DESIRED_STATE = {
  animals: ['Panda'],
};

describe('Zoo', () => {
  let store: Store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ZooState])],
    }).compileComponents();

    store = TestBed.get(Store);
    store.reset(SOME_DESIRED_STATE);
  }));

  it('it toggles feed', () => {
    store.dispatch(new FeedAnimals());
    store.selectOnce(state => state.zoo.feed).subscribe(feed => {
      expect(feed).toBe(true);
    });
  });
});
```

## Testing Selectors

Selectors are just plain functions that accept the state as the argument
so its really easy to test them. A simple test might look like this:

```TS
import { TestBed } from '@angular/core/testing';

describe('Zoo', () => {

  it('it should select pandas', () => {
    expect(
      Zoo.pandas(['pandas', 'zebras'])
    ).toBe(['pandas']);
  });
});
```

In your application you may have selectors created dynamically using the createSelector function:

```TS
export class ZooSelectors {
  static animalNames = (type: string) => {
    return createSelector(
      [ZooState],
      (state: ZooStateModel) => {
        return state.animals
          .filter(animal => animal.type === type)
          .map(animal => animal.name);
      }
    );
  };
}
```

Testing these selectors is really an easy task. 
You just need to mock the state and pass it as parameter to our selector:

```TS
it('should select requested animal names from state', () => {
  const zooState = {
    animals: [ 
      { type: 'zebra', name: 'Andy'},
      { type: 'panda', name: 'Betty'},
      { type: 'zebra', name: 'Crystal'},
      { type: 'panda', name: 'Donny'},
    ]
  };
  
  const value = ZooSelectors.animalNames('zebra')(zooState);
    
  expect(value).toEqual(['Andy', 'Crystal']);
});
```

## Testing asynchonous actions

It's also very easy to test asynchronous actions using Jasmine or Jest. The greatest features of these testing frameworks is a support of `async/await`. No one prevents you of using `async/await` + RxJS `toPromise` method that "converts" `Observable` to `Promise`. As an alternative you could you a `done` callback, Jasmine or Jest will wait until the `done` callback is called before finishing the test.

The below example is not really complex, but it clearly shows how to test asynchronous code using `async/await`:

```TS
import { timer } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';

it('should wait for completion of the asyncrhonous action', async () => {
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
  class CounterState {
    @Action(IncrementAsync)
    incrementAsync(ctx: StateContext<number>) {
      const delay = getRandomDelay();

      return timer(delay).pipe(
        tap(() => {
          // We're incrementing the state value and setting it
          ctx.setState((state) => state += 1);
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
          ctx.setState((state) => state -= 1);
        })
      );
    }
  }

  TestBed.configureTestingModule({
    imports: [NgxsModule.forRoot([CounterState])]
  });

  const store: Store = TestBed.get(Store);

  await store.dispatch(new IncrementAsync()).toPromise();

  const counter = store.selectSnapshot(CounterState);
  expect(counter).toBe(0);
});
```
