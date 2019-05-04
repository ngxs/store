# Unit Testing

Unit testing is easy with NGXS. To perform a unit test we just dispatch the events, listen to the changes and
perform our expectation. A basic test looks like this:

```TS
import { NgxsTestBed } from '@ngxs/store/testing';

describe('Zoo', () => {

  it('it toggles feed', (done) => {
    const { store } = NgxsTestBed.configureTestingState([ ZooState ]);

    store.dispatch(new FeedAnimals());
    store.selectOnce(state => state.zoo.feed).subscribe(feed => {
      expect(feed).toBe(true);
      done();
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
import { NgxsTestBed } from '@ngxs/store/testing';

export const SOME_DESIRED_STATE = {
  animals: ['Panda'],
};

describe('Zoo', () => {
  let store: Store;

  beforeEach(() => {
    store = NgxsTestBed.configureTestingState([ ZooState ]).store;
    store.reset(SOME_DESIRED_STATE);
  });

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
    expect( Zoo.pandas([ 'pandas', 'zebras' ]) ).toBe([ 'pandas' ]);
  });

});
```

In your application you may have selectors created dynamically using the createSelector function:

```TS
export class ZooSelectors {
  static animalNames = (type: string) => {
    return createSelector([ZooState], (state: ZooStateModel) => {
      return state.animals
        .filter((animal) => animal.type === type )
        .map((animal => animal.name ));
    });
  }
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
