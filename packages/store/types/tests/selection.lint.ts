/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { NgxsModule, Select, Selector, State, Store } from '../../src/public_api';
import { assertType } from './utils/assert-type';

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

    Selector(); // $ExpectType MethodDecorator
    assertType(() => Selector([{ foo: 'bar' }])); // $ExpectType MethodDecorator
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
      @Select(TodoState.reverse) public D$: number | object; // $ExpectType number | object
    }

    TestBed.get(CheckSelectorComponent); // $ExpectType any
  });

  it('should be correct passed selectors', () => {
    @State<object[]>({ name: 'zoo' })
    class Zoo {}

    @State<object[]>({ name: 'themePark' })
    class ThemePark {}

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

      @Selector(['Hello', 'World']) // $ExpectType (state: string[]) => string[]
      static pandas3(state: string[]): string[] {
        return state;
      }

      @Selector([Zoo, ThemePark]) // $ExpectType (zoos: object[], themeParks: object[]) => object[]
      static pandas4(zoos: object[], themeParks: object[]): object[] {
        return [...zoos, ...themeParks];
      }

      @Selector([() => {}, function custom() {}, { a: 1, b: 2 }]) // $ExpectType (state: string[]) => string[]
      static pandas5(state: string[]): string[] {
        return state;
      }
    }
  });
});
