/* tslint:disable:max-line-length */
/// <reference types="@types/jasmine" />
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { Action } from '../../src/decorators/action';
import { InitState, UpdateState } from '../../src/actions/actions';
import {
  createSelector,
  NgxsModule,
  Select,
  Selector,
  State,
  Store
} from '../../src/public_api';
import { assertType } from './utils/assert-type';

describe('[TEST]: Action Types', () => {
  let store: Store;

  class FooAction {
    public type = 'FOO';

    constructor(public payload: string) {}
  }

  class BarAction {
    public static type = 'BAR';

    constructor(public payload: string) {}
  }

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    store = TestBed.get(Store);
  });

  it('should be correct type in action decorator', () => {
    assertType(() => Action(UpdateState)); // $ExpectType (target: any, name: string) => void
    assertType(() => Action(new FooAction('payload'))); // $ExpectType (target: any, name: string) => void
    assertType(() => Action({ type: 'foo' })); // $ExpectType (target: any, name: string) => void
    assertType(() => Action([])); // $ExpectType (target: any, name: string) => void
    assertType(() => Action(BarAction)); // $ExpectType (target: any, name: string) => void
    assertType(() => Action([InitState, UpdateState])); // $ExpectType (target: any, name: string) => void
    assertType(() => Action([InitState], { cancelUncompleted: true })); // $ExpectType (target: any, name: string) => void
    assertType(() => Action(new BarAction('foo'))); // $ExpectError
    assertType(() => Action([{ foo: 'bar' }])); // $ExpectError
    assertType(() => Action([InitState, UpdateState], { foo: 'bar' })); // $ExpectError
    assertType(() => Action()); // $ExpectError
  });

  it('should be correct type in selector/select decorator', () => {
    class Any {}

    assertType(() => Selector()); // $ExpectType (target: any, methodName: string, descriptor: PropertyDescriptor) => { configurable: boolean; get(): any; }
    assertType(() => Selector([{ foo: 'bar' }])); // $ExpectType (target: any, methodName: string, descriptor: PropertyDescriptor) => { configurable: boolean; get(): any; }
    assertType(() => Selector({})); // $ExpectError

    assertType(() => Select()); // $ExpectType (target: any, name: string) => void
    assertType(() => Select({})); // $ExpectType (target: any, name: string) => void
    assertType(() => Select([])); // $ExpectType (target: any, name: string) => void
    assertType(() => Select(Any, 'a', 'b', 'c')); // $ExpectType (target: any, name: string) => void
    assertType(() => Select(Any, ['a', 'b', 'c'])); // $ExpectError

    class AppComponent {
      @Select() public foo$: any;
      @Select() public bar$: Observable<any>;
    }

    assertType(() => new AppComponent().foo$); // $ExpectType any
    assertType(() => new AppComponent().bar$); // $ExpectType Observable<any>
  });

  it('should be correct type in dispatch', () => {
    assertType(() => store.dispatch([])); // $ExpectType Observable<any>
    assertType(() => store.dispatch(new FooAction('payload'))); // $ExpectError Actions
    assertType(() => store.dispatch(new BarAction('foo'))); // $ExpectError Actions
    assertType(() => store.dispatch()); // $ExpectError
  });

  it('should prevent invalid types passed through', () => {
    class Increment {
      static type = 'INCREMENT';
    }

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class MyState {
      @Action(Increment) increment1() {} // $ExpectType () => void
      @Action({ type: 'INCREMENT' }) increment2() {} // $ExpectType () => void
      @Action(new Increment()) increment3() {} // $ExpectError
      @Action({ foo: 123 }) increment4() {} // $ExpectError
    }

    assertType(() => store.dispatch(new Increment())); // $ExpectType Observable<any>
    assertType(() => store.dispatch({ type: 'INCREMENT' })); // $ExpectType Observable<any>
    assertType(() => store.dispatch(Increment)); // $ExpectType Observable<any>
    assertType(() => store.dispatch({ foo: 123 })); // $ExpectType Observable<any>
  });

  it('should be correct type base API', () => {
    assertType(() => store.snapshot()); // $ExpectType any
    assertType(() => store.subscribe()); // $ExpectType Subscription
    assertType(() => store.reset({})); // $ExpectType any
    assertType(() => store.reset()); // $ExpectError
  });

  it('should be correct type for selection', () => {
    @State<string[]>({
      name: 'todo',
      defaults: []
    })
    class TodoState {
      @Selector() // $ExpectType (state: string[]) => string[]
      public static getTodo(state: string[]): string[] {
        return state;
      }
    }

    assertType(() => store.select(TodoState)); // $ExpectType Observable<any>
    assertType(() => store.select(TodoState.getTodo)); // $ExpectType Observable<string[]>
    assertType(() => store.select<string[]>(TodoState)); // $ExpectType Observable<string[]>
    assertType(() => store.select('state.value')); // $ExpectType Observable<any>
    assertType(() => store.select(state => state.foo.bar)); // $ExpectType Observable<any>
    assertType(() => store.select({ foo: 'bar' })); // $ExpectError
    assertType(() => store.select()); // $ExpectError

    assertType(() => store.selectOnce(TodoState)); // $ExpectType Observable<any>
    assertType(() => store.selectOnce(TodoState.getTodo)); // $ExpectType Observable<string[]>
    assertType(() => store.selectOnce<string[]>(TodoState)); // $ExpectType Observable<string[]>
    assertType(() => store.selectOnce('state.value')); // $ExpectType Observable<any>
    assertType(() => store.selectOnce(state => state.foo.bar)); // $ExpectType Observable<any>
    assertType(() => store.selectOnce({ foo: 'bar' })); // $ExpectError
    assertType(() => store.selectOnce()); // $ExpectError

    assertType(() => store.selectSnapshot(TodoState)); // $ExpectType any
    assertType(() => store.selectSnapshot(TodoState.getTodo)); // $ExpectType string[]
    assertType(() => store.selectSnapshot<string[]>(TodoState)); // $ExpectType string[]
    assertType(() => store.selectSnapshot('state.value')); // $ExpectType any
    assertType(() => store.selectSnapshot(state => state.foo.bar)); // $ExpectType any
    assertType(() => store.selectSnapshot({ foo: 'bar' })); // $ExpectError
    assertType(() => store.selectSnapshot()); // $ExpectError
  });

  it('should be correct detect type with store methods in component', () => {
    @State<string[]>({
      name: 'todo',
      defaults: []
    })
    class TodoState {
      @Selector() // $ExpectType (state: string[]) => string[]
      public static todo(state: string[]): string[] {
        return state;
      }
    }

    class TestComponent {
      public A1$: Observable<string[]> = this.select(TodoState.todo);
      public B1$: Observable<number[]> = this.select(TodoState.todo); // $ExpectError
      public C1$: Observable<number[]> = this.select<number[]>(TodoState.todo); // $ExpectError
      public D1$: Observable<number[]> = this.select<any>(TodoState.todo);
      public F1$: Observable<string[]> = this.select<string[]>(TodoState.todo);
      public A2$: Observable<string[]> = this.selectOnce(TodoState.todo);
      public B2$: Observable<number[]> = this.selectOnce(TodoState.todo); // $ExpectError
      public C2$: Observable<number[]> = this.selectOnce<number[]>(TodoState.todo); // $ExpectError
      public D2$: Observable<number[]> = this._store.selectOnce<any>(TodoState.todo);
      public F2$: Observable<string[]> = this._store.selectOnce<string[]>(TodoState.todo);
      public A3$: string[] = this.selectSnapshot(TodoState.todo);
      public B3$: number[] = this.selectSnapshot(TodoState.todo); // $ExpectError
      public C3$: number[] = this.selectSnapshot<number[]>(TodoState.todo); // $ExpectError
      public D3$: number[] = this.selectSnapshot<any>(TodoState.todo);
      public F3$: string[] = this.selectSnapshot<string[]>(TodoState.todo);

      constructor(private readonly _store: Store) {}

      private get selectSnapshot() {
        return this._store.selectSnapshot;
      }

      private get selectOnce() {
        return this._store.selectOnce;
      }

      private get select() {
        return this._store.select;
      }
    }

    const component: TestComponent = TestBed.get(TestComponent);

    assertType(() => component.A1$); // $ExpectType Observable<string[]>
    assertType(() => component.B1$); // $ExpectType Observable<number[]>
    assertType(() => component.C1$); // $ExpectType Observable<number[]>
    assertType(() => component.D1$); // $ExpectType Observable<number[]>
    assertType(() => component.F1$); // $ExpectType Observable<string[]>

    assertType(() => component.A2$); // $ExpectType Observable<string[]>
    assertType(() => component.B2$); // $ExpectType Observable<number[]>
    assertType(() => component.C2$); // $ExpectType Observable<number[]>
    assertType(() => component.D2$); // $ExpectType Observable<number[]>
    assertType(() => component.F2$); // $ExpectType Observable<string[]>

    assertType(() => component.A3$); // $ExpectType string[]
    assertType(() => component.B3$); // $ExpectType number[]
    assertType(() => component.C3$); // $ExpectType number[]
    assertType(() => component.D3$); // $ExpectType number[]
    assertType(() => component.F3$); // $ExpectType string[]
  });

  it('should be correct detect type with createSelector', () => {
    @State<string[]>({
      name: 'todo',
      defaults: []
    })
    class TodoState {
      // $ExpectType () => (state: string[]) => string[]
      static todoA() {
        return createSelector(
          [TodoState],
          (state: string[]) => state.map(todo => todo).reverse()
        );
      }

      // $ExpectType () => (...args: any[]) => any
      static todoB() {
        return createSelector([TodoState]); // $ExpectError
      }

      // $ExpectType () => (args: number) => string
      static todoC() {
        return createSelector<(args: number) => string>(
          [1, null, 'Hello world'],
          (state: number) => state.toString()
        );
      }

      // $ExpectType () => (state: Observable<number>) => Observable<number>
      static todoD() {
        return createSelector(
          [() => {}, [], {}, Infinity, NaN],
          (state: Observable<number>) => state,
          {
            containerClass: Infinity,
            selectorName: 'Hello world',
            getSelectorOptions: () => ({})
          }
        );
      }
    }

    assertType(() => store.selectSnapshot(TodoState.todoA())); // $ExpectType string[]
    assertType(() => store.selectSnapshot(TodoState.todoA)); // $ExpectType (state: string[]) => string[]
    assertType(() => store.selectSnapshot(TodoState.todoB())); // $ExpectType any
    assertType(() => store.selectSnapshot(TodoState.todoB)); // $ExpectType (...args: any[]) => any
    assertType(() => store.selectSnapshot(TodoState.todoC())); // $ExpectType string
    assertType(() => store.selectSnapshot(TodoState.todoC)); // $ExpectType (args: number) => string
    assertType(() => store.selectSnapshot(TodoState.todoD())); // $ExpectType Observable<number>
    assertType(() => store.selectSnapshot(TodoState.todoD)); // $ExpectType (state: Observable<number>) => Observable<number>
  });
});
