import { async, TestBed } from '@angular/core/testing';
import { StateClass } from '@ngxs/store/internals';

import { State } from '../src/decorators/state';
import { createSelector } from '../src/utils/selector-utils';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { Selector } from '../src/decorators/selector/selector';
import { NgxsConfig } from '../src/symbols';
import { SelectorOptions } from '../src/decorators/selector-options';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../src/configs/messages.config';

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

  describe('(Selector Options)', () => {
    function setupStore(states: StateClass[], extendedOptions?: Partial<NgxsConfig>) {
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

        @Selector()
        static invalid() {
          throw new Error('This is a forced error');
        }
      }

      it('should configure injectContainerState as false globally', async(() => {
        // Arrange
        const store = setupStore([MyStateV4_1, MyStateV4_2], {
          selectorOptions: {
            injectContainerState: false
          }
        });
        // Act & Assert
        expect(store.selectSnapshot(MyStateV4_1.foo)).toBe('Foo1');
        expect(store.selectSnapshot(MyStateV4_1.bar)).toBe('Bar1');
        expect(store.selectSnapshot(MyStateV4_1.fooAndBar)).toBe('Foo1Bar1');
        expect(store.selectSnapshot(MyStateV4_2.foo)).toBe('Foo2');
        expect(store.selectSnapshot(MyStateV4_2.bar)).toBe('Bar2');
        expect(store.selectSnapshot(MyStateV4_2.fooAndBar)).toBe('Foo2Bar2');
      }));

      it('should successfully globally configure no supression of selector errors', async(() => {
        // Arrange
        const store = setupStore([MyStateV4_1, MyStateV4_2], {
          selectorOptions: {
            suppressErrors: false
          }
        });
        // Act
        let exception: Error | null = null;
        try {
          store.selectSnapshot(MyStateV4_2.invalid);
        } catch (e) {
          exception = e;
        }
        // Assert
        expect(exception).not.toBeNull();
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
      @SelectorOptions({
        injectContainerState: false,
        suppressErrors: false
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

        @Selector([MyStateV4])
        static invalid() {
          throw new Error('This is a forced error');
        }
      }

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

      it('should successfully configure no supression of selector errors', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        let exception: Error | null = null;
        try {
          store.selectSnapshot(MyStateV4.invalid);
        } catch (e) {
          exception = e;
        }
        // Assert
        expect(exception).not.toBeNull();
      }));
    });

    describe('[at query class level]', () => {
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
      }

      @SelectorOptions({
        injectContainerState: false,
        suppressErrors: false
      })
      class MyStateV4Queries {
        @Selector([MyStateV4, MyStateV4.foo])
        static selfAndFoo(state: MyStateModel, myStateFoo: string) {
          return state.foo + myStateFoo;
        }

        @Selector([MyStateV4.foo, MyStateV4.bar])
        static fooAndBar(foo: string, bar: string) {
          return foo + bar;
        }

        @Selector([MyStateV4])
        static invalid() {
          throw new Error('This is a forced error');
        }
      }

      it('should select from a self joined selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSnapshot(MyStateV4Queries.selfAndFoo);
        // Assert
        expect(slice).toBe('FooFoo');
      }));

      it('should select from a joined selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSnapshot(MyStateV4Queries.fooAndBar);
        // Assert
        expect(slice).toBe('FooBar');
      }));

      it('should successfully configure no supression of selector errors', async(() => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        let exception: Error | null = null;
        try {
          store.selectSnapshot(MyStateV4Queries.invalid);
        } catch (e) {
          exception = e;
        }
        // Assert
        expect(exception).not.toBeNull();
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
        @SelectorOptions({ injectContainerState: false })
        static v4StyleSelector_FooAndBar(foo: string, bar: string) {
          return foo + bar;
        }

        @SelectorOptions({ injectContainerState: false })
        @Selector([MyStateV3.foo, MyStateV3.bar])
        static V4StyleSelector_flipped_FooAndBar(foo: string, bar: string) {
          return foo + bar;
        }

        @Selector([MyStateV3])
        @SelectorOptions({ suppressErrors: false })
        static invalid() {
          throw new Error('This is a forced error');
        }
      }

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

      it('should select from a v4 selector when provided before @Selector', async(() => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        const slice = store.selectSnapshot(MyStateV3.V4StyleSelector_flipped_FooAndBar);
        // Assert
        expect(slice).toBe('FooBar');
      }));

      it('should successfully configure no supression of selector errors', async(() => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        let exception: Error | null = null;
        try {
          store.selectSnapshot(MyStateV3.invalid);
        } catch (e) {
          exception = e;
        }
        // Assert
        expect(exception).not.toBeNull();
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

  describe('Errors in selectSnapshot', () => {
    @State<number[]>({
      name: 'tasks',
      defaults: [1, 2, 3, 4]
    })
    class TasksState {
      @Selector()
      static reverse(state: number[]): number[] {
        return state.reverse();
      }
    }

    beforeEach(() => {
      TestBed.resetTestingModule();
    });

    it('should be a wrong mutation', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TasksState])]
      });

      const store = TestBed.get(Store);
      store.reset({ tasks: [1, 2, 3, 4] });

      const tasks: number[] = store.selectSnapshot(TasksState);
      const reverse: number[] = store.selectSnapshot(TasksState.reverse);
      expect(tasks).toEqual([4, 3, 2, 1]);
      expect(reverse).toEqual([4, 3, 2, 1]);
    });

    it('should be incorrect mutation', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TasksState], { developmentMode: true })]
      });

      const store = TestBed.get(Store);
      store.reset({ tasks: [1, 2, 3, 4] });

      const tasks: number[] = store.selectSnapshot(TasksState);
      const reverse: number[] = store.selectSnapshot(TasksState.reverse);
      expect(tasks).toEqual([1, 2, 3, 4]);
      expect(reverse).toEqual(undefined as any);
    });

    it('should be correct catch errors with selectSnapshot', () => {
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([TasksState], {
            developmentMode: true,
            selectorOptions: { suppressErrors: false }
          })
        ]
      });

      const store = TestBed.get(Store);
      store.reset({ tasks: [1, 2, 3, 4] });

      const tasks: number[] = store.selectSnapshot(TasksState);
      expect(tasks).toEqual([1, 2, 3, 4]);

      try {
        store.selectSnapshot(TasksState.reverse);
      } catch (e) {
        expect(e.message.includes('Cannot assign to read only property')).toBe(true);
      }
    });
  });

  describe('Select errors', () => {
    @State<number[]>({
      name: 'tasks',
      defaults: [1, 2, 3, 4]
    })
    class NumberListState {
      @Selector()
      static reverse(state: number[]): number[] {
        return state.reverse();
      }
    }

    it('should be correct catch errors from observable with select', () => {
      let errorMessage = '';

      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([NumberListState], {
            developmentMode: true,
            selectorOptions: { suppressErrors: false }
          })
        ]
      });

      const store = TestBed.get(Store);
      store.reset({ tasks: [1, 2, 3, 4] });

      let snapshot: number[] = [];

      store.select(NumberListState).subscribe((state: number[]) => (snapshot = state));
      expect(snapshot).toEqual([1, 2, 3, 4]);

      store
        .select(NumberListState.reverse)
        .subscribe(
          (state: number[]) => (snapshot = state),
          (err: TypeError) => (errorMessage = err.message)
        );

      expect(snapshot).toEqual([1, 2, 3, 4]);
      expect(errorMessage).toEqual(
        `Cannot assign to read only property '0' of object '[object Array]'`
      );
    });

    it('@Selector should only work on methods', () => {
      try {
        class MyComponent {
          // @ts-ignore
          @Selector([]) public field: any;
        }

        new MyComponent();
      } catch (e) {
        expect(e.message).toEqual(CONFIG_MESSAGES[VALIDATION_CODE.SELECTOR_DECORATOR]());
      }
    });
  });
});
