import { async, TestBed } from '@angular/core/testing';
import { State } from '../src/decorators/state';
import { createSelector } from '../src/utils/selector-utils';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { Selector } from '../src/decorators/selector';

describe('Selector', () => {
  @State<any>({
    name: 'counter',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyState {
    @Selector()
    static foo(state) {
      return state.foo;
    }
  }

  @State<any>({
    name: 'zoo',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyState2 {
    @Selector([MyState.foo])
    static foo(myState2, myStateFoo) {
      return myState2.foo + myStateFoo;
    }

    @Selector([MyState2.foo])
    static fooBar(myState2, foo) {
      return foo + myState2.bar;
    }
  }

  class MetaSelector {
    @Selector([MyState.foo])
    static foo(myState) {
      return myState;
    }
  }

  describe('(Decorator)', () => {
    it('should select the state', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const slice = store.selectSnapshot(MyState.foo);
      expect(slice).toBe('Hello');
    }));

    it('should select using the meta selector', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const slice = store.selectSnapshot(MetaSelector.foo);
      expect(slice).toBe('Hello');
    }));

    it('should still be usable as a function', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const myState = store.selectSnapshot(<any>MyState);
      const slice = MyState.foo(myState);
      expect(slice).toBe('Hello');
    }));

    it('should select multiples', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState, MyState2])]
      });

      const store: Store = TestBed.get(Store);
      const slice = store.selectSnapshot(MyState2.foo);
      expect(slice).toBe('HelloHello');
    }));

    it('should select multiples from self and others', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState, MyState2])]
      });

      const store: Store = TestBed.get(Store);
      const slice = store.selectSnapshot(MyState2.fooBar);
      expect(slice).toBe('HelloHelloWorld');
    }));

    describe('(memoization)', () => {
      it('should memoize the last result', async(() => {
        const selectorCalls = [];

        @State<any>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        class TestState {
          @Selector()
          static foo(state) {
            selectorCalls.push('foo');
            return state.foo;
          }

          @Selector()
          static bar(state) {
            selectorCalls.push('bar');
            return state.bar;
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([TestState])]
        });

        const store: Store = TestBed.get(Store);
        store.selectSnapshot(TestState.foo);
        store.selectSnapshot(TestState.foo);
        store.selectSnapshot(TestState.bar);
        store.selectSnapshot(TestState.bar);
        store.selectSnapshot(TestState.foo);
        expect(selectorCalls).toEqual(['foo', 'bar']);
      }));

      it('should memoize the last result of an inner function', async(() => {
        const selectorCalls = [];

        @State<any>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        class TestState {
          @Selector()
          static foo(state) {
            selectorCalls.push('foo[outer]');
            return () => {
              selectorCalls.push('foo[inner]');
              return state.foo;
            };
          }
        }

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([TestState])]
        });

        const store: Store = TestBed.get(Store);
        store.selectSnapshot(TestState.foo);
        store.selectSnapshot(TestState.foo)();
        const fn = store.selectSnapshot(TestState.foo);
        fn();
        fn();
        store.selectSnapshot(TestState.foo);
        expect(selectorCalls).toEqual(['foo[outer]', 'foo[inner]']);
      }));
    });
  });

  describe('(from createSelector)', () => {
    it('should select the state', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector([MyState], state => state.foo);
      const slice = store.selectSnapshot(selector);
      expect(slice).toBe('Hello');
    }));

    it('should select using the meta selector', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector([MyState.foo], state => state);
      const slice = store.selectSnapshot(selector);
      expect(slice).toBe('Hello');
    }));

    it('should still be usable as a function', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const myState = store.selectSnapshot(<any>MyState);
      const selector = createSelector([MyState], state => state.foo);
      const slice = selector(myState);
      expect(slice).toBe('Hello');
    }));

    it('should select multiples', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState, MyState2])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector([MyState, MyState.foo], (state, foo) => state.foo + foo);
      const slice = store.selectSnapshot(selector);
      expect(slice).toBe('HelloHello');
    }));

    describe('(memoization)', () => {
      it('should memoize the last result', async(() => {
        const selectorCalls = [];

        @State<any>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        class TestState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([TestState])]
        });

        const store: Store = TestBed.get(Store);

        const fooSelector = createSelector([TestState], state => {
          selectorCalls.push('foo');
          return state.foo;
        });
        const barSelector = createSelector([TestState], state => {
          selectorCalls.push('bar');
          return state.bar;
        });
        store.selectSnapshot(fooSelector);
        store.selectSnapshot(fooSelector);
        store.selectSnapshot(barSelector);
        store.selectSnapshot(barSelector);
        store.selectSnapshot(fooSelector);
        expect(selectorCalls).toEqual(['foo', 'bar']);
      }));

      it('should memoize the last result of an inner function', async(() => {
        const selectorCalls = [];

        @State<any>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        class TestState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([TestState])]
        });

        const store: Store = TestBed.get(Store);
        const fooSelector = createSelector([TestState], state => {
          selectorCalls.push('foo[outer]');
          return () => {
            selectorCalls.push('foo[inner]');
            return state.foo;
          };
        });
        store.selectSnapshot(fooSelector);
        store.selectSnapshot(fooSelector)();
        const fn = store.selectSnapshot(fooSelector);
        fn();
        fn();
        store.selectSnapshot(fooSelector);
        expect(selectorCalls).toEqual(['foo[outer]', 'foo[inner]']);
      }));
    });
  });
});
