# Unit Testing
Unit testing is easy since, we just need to dispatch events and then listen in on the changes and
perform our expectation there. A basic test looks like this:

```javascript
describe('Zoo', () => {
  let ngxs: Ngxs;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ZooStore])],
      providers: [ZooStore],
    }).compileComponents();
    ngxs = TestBed.get(Ngxs);
  }));

  it('it toggles feed', () => {
    ngxs.dispatch(new FeedAnimals());
    ngxs.select(state => state.zoo.feed).subscribe(feed => {
      expect(feed).toBe(true);
    });
  });

});
```
