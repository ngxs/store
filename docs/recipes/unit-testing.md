# Unit Testing

Unit testing is easy with NGXS. To perform a unit test we just dispatch the events, listen to the changes and
perform our expectation. A basic test looks like this:

```TS
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
  animals: ['Panda']
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
