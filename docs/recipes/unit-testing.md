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

Often times in your app you want to test what happens when the state is C and you dispatch action X. Since NGXS
allows you to dispatch multiple actions at once it is simple to create helpers that put your tests into the desired state.

```TS
// zoo.state.helpers.ts
export const SOME_DESIRED_STATE = [
  new Action1(),
  new Action1(),
  new Action2(),
  new Action1(),
  new Action2()
]

//zoo.state.spec.ts
import { TestBed, async } from '@angular/core/testing';

import { SOME_DESIRED_STATE } from './zoo.state.helpers';

describe('Zoo', () => {
  let store: Store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ZooState])],
    }).compileComponents();

    store = TestBed.get(Store);

    store.dispatch(SOME_DESIRED_STATE);
  }));

  it('it toggles feed', () => {
    store.dispatch(new FeedAnimals());
    store.selectOnce(state => state.zoo.feed).subscribe(feed => {
      expect(feed).toBe(true);
    });
  });
});
```
