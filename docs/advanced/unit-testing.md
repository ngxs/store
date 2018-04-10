# Unit Testing
Unit testing is easy since, we just need to dispatch events and then listen in on the changes and
perform our expectation there. A basic test looks like this:

```typescript
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
