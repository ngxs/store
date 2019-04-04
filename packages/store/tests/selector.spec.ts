import { async, TestBed } from '@angular/core/testing';
import { State } from '../src/decorators/state';
import { createSelector } from '../src/utils/selector-utils';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { Selector } from '../src/decorators/selector';
import { ensureStoreMetadata, getStoreMetadata } from '../src/public_api';
import {
  StateClass,
  getSelectorMetadata,
  InternalSelectorOptions
} from '../src/internal/internals';
import { NgxsConfig } from '../src/symbols';

describe('Selector', () => {
  interface MyStateModel {
    foo: string;
    bar: string;
  }

  @State<MyStateModel>({
    name: 'counter',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyState {
    @Selector()
    static foo(state: MyStateModel) {
      return state.foo;
    }
  }

  @State<MyStateModel>({
    name: 'zoo',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyState2 {
    @Selector([MyState.foo])
    static foo(myState2: MyStateModel, myStateFoo: string) {
      return myState2.foo + myStateFoo;
    }

    @Selector([MyState2.foo])
    static fooBar(myState2: MyStateModel, foo: string) {
      return foo + myState2.bar;
    }
  }

  class MetaSelector {
    @Selector([MyState.foo])
    static foo(myState: string) {
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
      const myState = store.selectSnapshot<MyStateModel>(MyState);
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

    it('context should be defined inside selector', () => {
      @State<any>({
        name: 'counter',
        defaults: {
          value: 0
        }
      })
      class TestState {
        @Selector()
        static foo(state: any) {
          expect(this).toBe(TestState);
          const bar = this.bar();
          expect(bar).toEqual(10);
          return state.value;
        }

        static bar() {
          return 10;
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestState])]
      });

      const store: Store = TestBed.get(Store);
      store.selectSnapshot(TestState.foo);
    });

    describe('(memoization)', () => {
      it('should memoize the last result', async(() => {
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        class TestState {
          @Selector()
          static foo(state: MyStateModel) {
            selectorCalls.push('foo');
            return state.foo;
          }

          @Selector()
          static bar(state: MyStateModel) {
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
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        class TestState {
          @Selector()
          static foo(state: MyStateModel) {
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

  describe('(Decorator - v4 options)', () => {
    function setupStore(states: StateClass<any, any>[], extendedOptions?: any) {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot(states, extendedOptions)]
      });
      const store: Store = TestBed.get(Store);
      return store;
    }

    describe('[at global level]', () => {
      @State<MyStateModel>({
        name: 'zoo_1',
        defaults: {
          foo: 'Foo1',
          bar: 'Bar1'
        }
      })
      // tslint:disable-next-line: class-name
      class MyStateV4_1 {
        @Selector()
        static foo(state: MyStateModel) {
          return state.foo;
        }

        @Selector()
        static bar(state: MyStateModel) {
          return state.bar;
        }

        @Selector([MyStateV4_1.foo, MyStateV4_1.bar])
        static fooAndBar(foo: string, bar: string) {
          return foo + bar;
        }
      }

      @State<MyStateModel>({
        name: 'zoo_2',
        defaults: {
          foo: 'Foo2',
          bar: 'Bar2'
        }
      })
      // tslint:disable-next-line: class-name
      class MyStateV4_2 {
        @Selector()
        static foo(state: MyStateModel) {
          return state.foo;
        }

        @Selector()
        static bar(state: MyStateModel) {
          return state.bar;
        }

        @Selector([MyStateV4_2.foo, MyStateV4_2.bar])
        static fooAndBar(foo: string, bar: string) {
          return foo + bar;
        }
      }

      it('should configure v4 selectors globally', async(() => {
        // Arrange
        const store = setupStore([MyStateV4_1, MyStateV4_2], {
          internalSelectorOptions: <InternalSelectorOptions>{ injectContainerState: false }
        });
        // Act & Assert
        expect(store.selectSnapshot(MyStateV4_1.foo)).toBe('Foo1');
        expect(store.selectSnapshot(MyStateV4_1.bar)).toBe('Bar1');
        expect(store.selectSnapshot(MyStateV4_1.fooAndBar)).toBe('Foo1Bar1');
        expect(store.selectSnapshot(MyStateV4_2.foo)).toBe('Foo2');
        expect(store.selectSnapshot(MyStateV4_2.bar)).toBe('Bar2');
        expect(store.selectSnapshot(MyStateV4_2.fooAndBar)).toBe('Foo2Bar2');
      }));
    });

    describe('[at class level]', () => {
      @State<MyStateModel>({
        name: 'zoo',
        defaults: {
          foo: 'Foo',
          bar: 'Bar'
        }
      })
      class MyStateV4 {
        @Selector()
        static foo(state: MyStateModel) {
          return state.foo;
        }

        @Selector()
        static bar(state: MyStateModel) {
          return state.bar;
        }

        @Selector([MyStateV4, MyStateV4.foo])
        static selfAndFoo(state: MyStateModel, myStateFoo: string) {
          return state.foo + myStateFoo;
        }

        @Selector([MyStateV4.foo, MyStateV4.bar])
        static fooAndBar(foo: string, bar: string) {
          return foo + bar;
        }
      }
      getStoreMetadata(MyStateV4).internalSelectorOptions = { injectContainerState: false };

      it('should select from a simple selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSnapshot(MyStateV4.foo);
        // Assert
        expect(slice).toBe('Foo');
      }));

      it('should select from another simple selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSnapshot(MyStateV4.bar);
        // Assert
        expect(slice).toBe('Bar');
      }));

      it('should select from a self joined selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSnapshot(MyStateV4.selfAndFoo);
        // Assert
        expect(slice).toBe('FooFoo');
      }));

      it('should select from a joined selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSnapshot(MyStateV4.fooAndBar);
        // Assert
        expect(slice).toBe('FooBar');
      }));
    });

    describe('[at method level]', () => {
      @State<MyStateModel>({
        name: 'zoo',
        defaults: {
          foo: 'Foo',
          bar: 'Bar'
        }
      })
      class MyStateV3 {
        @Selector()
        static foo(state: MyStateModel) {
          return state.foo;
        }

        @Selector()
        static bar(state: MyStateModel) {
          return state.bar;
        }

        @Selector([MyStateV3.bar])
        static v3StyleSelector_FooAndBar(state: MyStateModel, bar: string) {
          return state.foo + bar;
        }
        @Selector([MyStateV3.foo, MyStateV3.bar])
        static v4StyleSelector_FooAndBar(foo: string, bar: string) {
          return foo + bar;
        }
      }
      getSelectorMetadata(MyStateV3.v4StyleSelector_FooAndBar).selectorOptions = {
        injectContainerState: false
      };

      it('should select from a v3 selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        const slice = store.selectSnapshot(MyStateV3.v3StyleSelector_FooAndBar);
        // Assert
        expect(slice).toBe('FooBar');
      }));

      it('should select from a v4 selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        const slice = store.selectSnapshot(MyStateV3.v4StyleSelector_FooAndBar);
        // Assert
        expect(slice).toBe('FooBar');
      }));
    });
  });

  describe('(from createSelector)', () => {
    it('should select the state', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector(
        [MyState],
        (state: MyStateModel) => state.foo
      );
      const slice: string = store.selectSnapshot(selector);
      expect(slice).toBe('Hello');
    }));

    it('should allow for null in the returned value [regression fix]', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector(
        [MyState],
        (state: MyStateModel) => {
          const foo = state.foo;
          return foo === 'Hello' ? null : foo;
        }
      );
      const slice = store.selectSnapshot(selector);
      expect(slice).toBe(null);
    }));

    it('should allow for undefined in the returned value [regression fix]', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector(
        [MyState],
        (state: MyStateModel) => {
          const foo = state.foo;
          return foo === 'Hello' ? undefined : foo;
        }
      );
      const slice = store.selectSnapshot(selector);
      expect(slice).toBe(undefined);
    }));

    it('should select using the meta selector', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector(
        [MyState.foo],
        (state: string) => state
      );
      const slice: string = store.selectSnapshot(selector);
      expect(slice).toBe('Hello');
    }));

    it('should still be usable as a function', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store: Store = TestBed.get(Store);
      const myState = store.selectSnapshot<MyStateModel>(MyState);
      const selector = createSelector(
        [MyState],
        (state: MyStateModel) => state.foo
      );
      const slice: string = selector(myState);
      expect(slice).toBe('Hello');
    }));

    it('should select multiples', async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState, MyState2])]
      });

      const store: Store = TestBed.get(Store);
      const selector = createSelector(
        [MyState, MyState.foo],
        (state: MyStateModel, foo: string) => state.foo + foo
      );
      const slice: string = store.selectSnapshot(selector);
      expect(slice).toBe('HelloHello');
    }));

    describe('(memoization)', () => {
      it('should memoize the last result', async(() => {
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
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

        const fooSelector = createSelector(
          [TestState],
          (state: MyStateModel) => {
            selectorCalls.push('foo');
            return state.foo;
          }
        );
        const barSelector = createSelector(
          [TestState],
          (state: MyStateModel) => {
            selectorCalls.push('bar');
            return state.bar;
          }
        );
        store.selectSnapshot(fooSelector);
        store.selectSnapshot(fooSelector);
        store.selectSnapshot(barSelector);
        store.selectSnapshot(barSelector);
        store.selectSnapshot(fooSelector);
        expect(selectorCalls).toEqual(['foo', 'bar']);
      }));

      it('should memoize the last result of an inner function', async(() => {
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
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
        const fooSelector = createSelector(
          [TestState],
          (state: MyStateModel) => {
            selectorCalls.push('foo[outer]');
            return () => {
              selectorCalls.push('foo[inner]');
              return state.foo;
            };
          }
        );
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
