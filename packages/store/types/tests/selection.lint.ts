/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { TestBed } from '@angular/core/testing';
import { NgxsModule, Select, Selector, State, StateToken, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { assertType } from './utils/assert-type';
import { Component } from '@angular/core';
import {
  createSelectObservable,
  createSelectorFn,
  PropertyType
} from '../../src/decorators/select/symbols';

describe('[TEST]: Action Types', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    store = TestBed.get(Store);
  });

  it('should be correct type in selector/select decorator', () => {
    class Any {}

    Selector(); // $ExpectType SelectorType<unknown>
    assertType(() => Selector([{ foo: 'bar' }])); // $ExpectError
    assertType(() => Selector({})); // $ExpectError

    Select(); // $ExpectType PropertyDecorator
    assertType(() => Select({})); // $ExpectType PropertyDecorator
    assertType(() => Select([])); // $ExpectType PropertyDecorator
    assertType(() => Select(Any, 'a', 'b', 'c')); // $ExpectType PropertyDecorator
    assertType(() => Select(Any, ['a', 'b', 'c'])); // $ExpectError

    class AppComponent {
      @Select() public foo$: any;
      @Select() public bar$: Observable<any>;
    }

    assertType(() => new AppComponent().foo$); // $ExpectType any
    assertType(() => new AppComponent().bar$); // $ExpectType Observable<any>
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
      public static reverse(state: string[]): string[] {
        return state.reverse();
      }
    }

    type Any = number | string | boolean | object;

    class CheckSelectorComponent {
      @Select() public A$: Observable<any>; // $ExpectType Observable<any>
      @Select(TodoState) public B$: Observable<Any>; // $ExpectType Observable<Any>
      @Select(TodoState.reverse) public C$: Observable<Any>; // $ExpectType Observable<Any>
      @Select(TodoState.reverse) public C1$: Observable<string[]>; // $ExpectType Observable<string[]>
      @Select(TodoState.reverse) public D$: number | object; // $ExpectType number | object
      @Select(TodoState.reverse) public D1$: Observable<string[]>; // $ExpectType Observable<string[]>
    }

    TestBed.get(CheckSelectorComponent); // $ExpectType any
  });

  it('should be correct passed selectors', () => {
    @State<object[]>({ name: 'zoo' })
    class Zoo {}

    @State<object[]>({ name: 'themePark' })
    class ThemePark {}

    const numberSelector = (): number => 3;
    const stringSelector = (): string => 'a';
    const nullableStringSelector = (): string | null => null;

    class MyPandaState {
      @Selector() static pandas0 = (state: string[]): string[] => state; // $ExpectError

      @Selector() // $ExpectType (state: string[]) => string[]
      static pandas1(state: string[]): string[] {
        return state;
      }

      @Selector([]) // $ExpectType (state: string[]) => string[]
      static pandas2(state: string[]): string[] {
        return state;
      }

      @Selector(['Hello', 'World']) // $ExpectError
      static pandas3(state: string[]): string[] {
        return state;
      }

      @Selector([Zoo, ThemePark]) // $ExpectType (zoos: object[], themeParks: object[]) => object[]
      static pandas4(zoos: object[], themeParks: object[]): object[] {
        return [...zoos, ...themeParks];
      }

      @Selector([() => {}, function custom() {}, { a: 1, b: 2 }]) // $ExpectError
      static pandas5(state: string[]): string[] {
        return state;
      }

      // Injected state - selector with no matching argument
      @Selector([numberSelector]) // $ExpectError
      static pandas6(state: string[]): number {
        return state.length;
      }

      // Injected state - argument with no matching selector
      @Selector([numberSelector]) // $ExpectError
      static pandas7(state: string[], other: number, other2: string): number {
        return state.length + other + other2.length;
      }

      // Injected state - type mismatch (swapped string/number)
      @Selector([numberSelector, stringSelector]) // $ExpectError
      static pandas8(state: string[], other: string, other2: number): number {
        return state.length + other.length + other2;
      }

      // Injected state - unhandled nullability
      @Selector([numberSelector, nullableStringSelector]) // $ExpectError
      static pandas9(state: string[], other: number, other2: string): number {
        return state.length + other + other2.length;
      }

      // Injected state - correct arguments
      @Selector([numberSelector, stringSelector]) // $ExpectType (state: string[], other: number, other2: string) => number
      static pandas10(state: string[], other: number, other2: string): number {
        return state.length + other + other2.length;
      }

      // No injected state - selector with no matching argument
      @Selector([numberSelector]) // $ExpectError
      static pandas11(): number {
        return 0;
      }

      // No injected state - argument with no matching selector
      @Selector([numberSelector]) // $ExpectError
      static pandas12(other: number, other2: string): number {
        return other + other2.length;
      }

      // No injected state - type mismatch (swapped string/number)
      @Selector([numberSelector, stringSelector]) // $ExpectError
      static pandas13(other: string, other2: number): number {
        return other.length + other2;
      }

      // No injected state - unhandled nullability
      @Selector([numberSelector, nullableStringSelector]) // $ExpectError
      static pandas14(other: number, other2: string): number {
        return other + other2.length;
      }

      // No injected state - correct arguments
      @Selector([numberSelector, stringSelector]) // $ExpectType (other: number, other2: string) => number
      static pandas15(other: number, other2: string): number {
        return other + other2.length;
      }
    }
  });

  it('should support protected and private methods (https://github.com/ngxs/store/issues/1532)', () => {
    const TODOS_TOKEN = new StateToken<string[]>('todos');

    @State({ name: TODOS_TOKEN })
    class TodosState {
      @Selector([TODOS_TOKEN]) // $ExpectType (state: string[]) => string[]
      public static publicState(state: string[]) {
        return state;
      }

      @Selector([TODOS_TOKEN]) // $ExpectType (state: string[]) => string[]
      protected static protectedState(state: string[]) {
        return state;
      }

      @Selector([TODOS_TOKEN]) // $ExpectType (state: string[]) => string[]
      private static privateState(state: string[]) {
        return state;
      }
    }

    @Component({ selector: 'app' })
    class AppComponent {
      // $ExpectType Observable<any>
      @Select(TODOS_TOKEN) public readonly publicTodos: Observable<any>;

      // $ExpectType Observable<any>
      @Select(TODOS_TOKEN) protected readonly protectedTodos: Observable<any>;

      // $ExpectType Observable<any>
      @Select(TODOS_TOKEN) private readonly privateTodos: Observable<any>;
    }

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [NgxsModule.forRoot([TodosState])]
    });
  });
});
