import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  State,
  createSelector,
  Store,
  NgxsModule,
  Selector,
  SelectorOptions
} from '@ngxs/store';
import { ɵStateClass } from '@ngxs/store/internals';

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
  @Injectable()
  class MyState {
    @Selector()
    static getState(state: MyStateModel) {
      return state;
    }

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
  @Injectable()
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
    it('should select the state', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store = TestBed.inject(Store);
      const slice = store.selectSignal(MyState.foo);
      expect(slice()).toBe('Hello');
    });

    it('should select using the meta selector', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store = TestBed.inject(Store);
      const slice = store.selectSignal(MetaSelector.foo);
      expect(slice()).toBe('Hello');
    });

    it('should select multiples', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState, MyState2])]
      });

      const store = TestBed.inject(Store);
      const slice = store.selectSignal(MyState2.foo);
      expect(slice()).toBe('HelloHello');
    });

    it('should select multiples from self and others', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState, MyState2])]
      });

      const store = TestBed.inject(Store);
      const slice = store.selectSignal(MyState2.fooBar);
      expect(slice()).toBe('HelloHelloWorld');
    });

    it('context should be defined inside selector', () => {
      @State<any>({
        name: 'counter',
        defaults: {
          value: 0
        }
      })
      @Injectable()
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

      const store = TestBed.inject(Store);
      store.selectSignal(TestState.foo)();
    });

    describe('(memoization)', () => {
      it('should memoize the last result', () => {
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        @Injectable()
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

        const store = TestBed.inject(Store);
        store.selectSignal(TestState.foo)();
        store.selectSignal(TestState.foo)();
        store.selectSignal(TestState.bar)();
        store.selectSignal(TestState.bar)();
        store.selectSignal(TestState.foo)();
        expect(selectorCalls).toEqual(['foo', 'bar']);
      });

      it('should memoize the last result of an inner function', () => {
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        @Injectable()
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

        const store = TestBed.inject(Store);
        store.selectSignal(TestState.foo)();
        store.selectSignal(TestState.foo)()();
        const fn = store.selectSignal(TestState.foo)();
        fn();
        fn();
        store.selectSignal(TestState.foo)();
        expect(selectorCalls).toEqual(['foo[outer]', 'foo[inner]']);
      });
    });
  });

  describe('(Selector Options)', () => {
    function setupStore(states: ɵStateClass[], extendedOptions?: Partial<NgxsConfig>) {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot(states, extendedOptions)]
      });
      const store = TestBed.inject(Store);
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
      @Injectable()
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
      @Injectable()
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

      it('should configure injectContainerState as false globally', () => {
        // Arrange
        const store = setupStore([MyStateV4_1, MyStateV4_2], {
          selectorOptions: {
            injectContainerState: false
          }
        });
        // Act & Assert
        expect(store.selectSignal(MyStateV4_1.foo)()).toBe('Foo1');
        expect(store.selectSignal(MyStateV4_1.bar)()).toBe('Bar1');
        expect(store.selectSignal(MyStateV4_1.fooAndBar)()).toBe('Foo1Bar1');
        expect(store.selectSignal(MyStateV4_2.foo)()).toBe('Foo2');
        expect(store.selectSignal(MyStateV4_2.bar)()).toBe('Bar2');
        expect(store.selectSignal(MyStateV4_2.fooAndBar)()).toBe('Foo2Bar2');
      });

      it('should successfully globally configure no supression of selector errors', () => {
        // Arrange
        const store = setupStore([MyStateV4_1, MyStateV4_2], {
          selectorOptions: {
            suppressErrors: false
          }
        });
        // Act
        let exception: Error | null = null;
        try {
          store.selectSignal(MyStateV4_2.invalid)();
        } catch (e) {
          exception = e as Error;
        }
        // Assert
        expect(exception).not.toBeNull();
      });
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
      @Injectable()
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

      it('should select from a simple selector', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSignal(MyStateV4.foo);
        // Assert
        expect(slice()).toBe('Foo');
      });

      it('should select from another simple selector', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSignal(MyStateV4.bar);
        // Assert
        expect(slice()).toBe('Bar');
      });

      it('should select from a self joined selector', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSignal(MyStateV4.selfAndFoo);
        // Assert
        expect(slice()).toBe('FooFoo');
      });

      it('should select from a joined selector', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSignal(MyStateV4.fooAndBar);
        // Assert
        expect(slice()).toBe('FooBar');
      });

      it('should successfully configure no supression of selector errors', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        let exception: Error | null = null;
        try {
          store.selectSignal(MyStateV4.invalid)();
        } catch (e) {
          exception = e as Error;
        }
        // Assert
        expect(exception).not.toBeNull();
      });
    });

    describe('[at query class level]', () => {
      @State<MyStateModel>({
        name: 'zoo',
        defaults: {
          foo: 'Foo',
          bar: 'Bar'
        }
      })
      @Injectable()
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

      it('should select from a self joined selector', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSignal(MyStateV4Queries.selfAndFoo);
        // Assert
        expect(slice()).toBe('FooFoo');
      });

      it('should select from a joined selector', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        const slice = store.selectSignal(MyStateV4Queries.fooAndBar);
        // Assert
        expect(slice()).toBe('FooBar');
      });

      it('should successfully configure no supression of selector errors', () => {
        // Arrange
        const store = setupStore([MyStateV4]);
        // Act
        let exception: Error | null = null;
        try {
          store.selectSignal(MyStateV4Queries.invalid)();
        } catch (e) {
          exception = e as Error;
        }
        // Assert
        expect(exception).not.toBeNull();
      });
    });

    describe('[at method level]', () => {
      @State<MyStateModel>({
        name: 'zoo',
        defaults: {
          foo: 'Foo',
          bar: 'Bar'
        }
      })
      @Injectable()
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

      it('should select from a v3 selector', () => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        const slice = store.selectSignal(MyStateV3.v3StyleSelector_FooAndBar);
        // Assert
        expect(slice()).toBe('FooBar');
      });

      it('should select from a v4 selector', () => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        const slice = store.selectSignal(MyStateV3.v4StyleSelector_FooAndBar);
        // Assert
        expect(slice()).toBe('FooBar');
      });

      it('should select from a v4 selector when provided before @Selector', () => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        const slice = store.selectSignal(MyStateV3.V4StyleSelector_flipped_FooAndBar);
        // Assert
        expect(slice()).toBe('FooBar');
      });

      it('should successfully configure no supression of selector errors', () => {
        // Arrange
        const store = setupStore([MyStateV3]);
        // Act
        let exception: Error | null = null;
        try {
          store.selectSignal(MyStateV3.invalid)();
        } catch (e) {
          exception = e as Error;
        }
        // Assert
        expect(exception).not.toBeNull();
      });
    });
  });

  describe('(from createSelector)', () => {
    it('should select the state', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store = TestBed.inject(Store);
      const selector = createSelector([MyState], (state: MyStateModel) => state.foo);
      const slice = store.selectSignal(selector);
      expect(slice()).toBe('Hello');
    });

    it('should allow for null in the returned value [regression fix]', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store = TestBed.inject(Store);
      const selector = createSelector([MyState], (state: MyStateModel) => {
        const foo = state.foo;
        return foo === 'Hello' ? null : foo;
      });
      const slice = store.selectSignal(selector);
      expect(slice()).toBe(null);
    });

    it('should allow for undefined in the returned value [regression fix]', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store = TestBed.inject(Store);
      const selector = createSelector([MyState], (state: MyStateModel) => {
        const foo = state.foo;
        return foo === 'Hello' ? undefined : foo;
      });
      const slice = store.selectSignal(selector);
      expect(slice()).toBe(undefined);
    });

    it('should select using the meta selector', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store = TestBed.inject(Store);
      const selector = createSelector([MyState.foo], (state: string) => state);
      const slice = store.selectSignal(selector);
      expect(slice()).toBe('Hello');
    });

    it('should still be usable as a function', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState])]
      });

      const store = TestBed.inject(Store);
      const myState = store.selectSignal<MyStateModel>(MyState.getState);
      const selector = createSelector([MyState], (state: MyStateModel) => state.foo);
      const slice = selector(myState());
      expect(slice).toBe('Hello');
    });

    it('should select multiples', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyState, MyState2])]
      });

      const store = TestBed.inject(Store);
      const selector = createSelector(
        [MyState, MyState.foo],
        (state: MyStateModel, foo: string) => state.foo + foo
      );
      const slice = store.selectSignal(selector);
      expect(slice()).toBe('HelloHello');
    });

    describe('(memoization)', () => {
      it('should memoize the last result', () => {
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        @Injectable()
        class TestState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([TestState])]
        });

        const store = TestBed.inject(Store);

        const fooSelector = createSelector([TestState], (state: MyStateModel) => {
          selectorCalls.push('foo');
          return state.foo;
        });
        const barSelector = createSelector([TestState], (state: MyStateModel) => {
          selectorCalls.push('bar');
          return state.bar;
        });
        store.selectSignal(fooSelector)();
        store.selectSignal(fooSelector)();
        store.selectSignal(barSelector)();
        store.selectSignal(barSelector)();
        store.selectSignal(fooSelector)();
        expect(selectorCalls).toEqual(['foo', 'bar']);
      });

      it('should memoize the last result of an inner function', () => {
        const selectorCalls: string[] = [];

        @State<MyStateModel>({
          name: 'counter',
          defaults: {
            foo: 'Hello',
            bar: 'World'
          }
        })
        @Injectable()
        class TestState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([TestState])]
        });

        const store = TestBed.inject(Store);
        const fooSelector = createSelector([TestState], (state: MyStateModel) => {
          selectorCalls.push('foo[outer]');
          return () => {
            selectorCalls.push('foo[inner]');
            return state.foo;
          };
        });
        store.selectSignal(fooSelector)();
        store.selectSignal(fooSelector)()();
        const fn = store.selectSignal(fooSelector)();
        fn();
        fn();
        store.selectSignal(fooSelector)();
        expect(selectorCalls).toEqual(['foo[outer]', 'foo[inner]']);
      });
    });
  });

  describe('Errors in selectSnapshot', () => {
    @State<number[]>({
      name: 'tasks',
      defaults: [1, 2, 3, 4]
    })
    @Injectable()
    class TasksState {
      @Selector()
      static getTasks(state: number[]) {
        return state;
      }

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

      const store = TestBed.inject(Store);
      store.reset({ tasks: [1, 2, 3, 4] });

      const tasks = store.selectSignal(TasksState.getTasks)();
      const reverse = store.selectSignal(TasksState.reverse)();
      expect(tasks).toEqual([4, 3, 2, 1]);
      expect(reverse).toEqual([4, 3, 2, 1]);
    });

    it('should be incorrect mutation', () => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TasksState], { developmentMode: true })]
      });

      const store = TestBed.inject(Store);
      store.reset({ tasks: [1, 2, 3, 4] });

      const tasks = store.selectSignal(TasksState.getTasks);
      const reverse = store.selectSignal(TasksState.reverse);
      expect(tasks()).toEqual([1, 2, 3, 4]);
      expect(reverse()).toEqual(undefined as any);
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

      const store = TestBed.inject(Store);
      store.reset({ tasks: [1, 2, 3, 4] });

      const tasks = store.selectSignal(TasksState.getTasks);
      expect(tasks()).toEqual([1, 2, 3, 4]);

      try {
        store.selectSignal(TasksState.reverse)();
      } catch (e) {
        expect((e as Error).message.includes('Cannot assign to read only property')).toBe(
          true
        );
      }
    });
  });

  describe('when declared out of order', () => {
    interface Contact {
      name: string;
    }

    type EntityMap<T> = {
      [id: string]: T;
    };

    interface ContactsStateModel {
      entities: EntityMap<Contact>;
      ids: number[];
    }

    @State<ContactsStateModel>({
      name: 'contacts',
      defaults: {
        entities: {},
        ids: []
      }
    })
    @Injectable()
    class ContactsState {
      @Selector([ContactsState.ids, ContactsState.entityMap])
      static orderedContactNames(ids: number[], map: EntityMap<Contact>) {
        return ids.map(id => map[id].name);
      }

      @Selector()
      private static ids(state: ContactsStateModel) {
        return state.ids;
      }

      @Selector()
      private static entityMap(state: ContactsStateModel) {
        return state.entities;
      }
    }

    function setup(initialState?: { contacts: ContactsStateModel }) {
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([ContactsState], {
            selectorOptions: { suppressErrors: false, injectContainerState: false }
          })
        ]
      });

      const store = TestBed.inject(Store);
      if (initialState) {
        store.reset(initialState);
      }
      return { store };
    }

    it('should not give error for selector', () => {
      // Arrange
      const { store } = setup({
        contacts: {
          entities: {
            456: { name: 'Artur' },
            234: { name: 'Mark' },
            123: { name: 'Max' }
          },
          ids: [234, 123, 456]
        }
      });
      // Act
      const result = store.selectSignal(ContactsState.orderedContactNames);
      // Assert
      expect(result()).toEqual(['Mark', 'Max', 'Artur']);
    });
  });
});
