# Unit Testing

Unit testing is easy since, we just need to dispatch events and then listen in on the changes and
perform our expectation there. A basic test looks like this:

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

You might notice I use `selectOnce` rather than just `select`, this is a shortcut
method that lets us only listen for one emit which is typically what we want
for unit testing.

## Prepping State

Often times if your app you need to test what happens when you state is C and you dispatch action X. Since NGXS
allows you to dispatch multiple actions at once it is simple to create helpers and put your tests into the desired state.

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
