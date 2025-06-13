/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { TestBed } from '@angular/core/testing';
import { NgxsModule, Selector, State, Store } from '@ngxs/store';

import { assertType } from './utils/assert-type';

describe('[TEST]: Action Types', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    store = TestBed.inject(Store);
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

    assertType(() => store.select(TodoState.getTodo)); // $ExpectType Observable<string[]>
    assertType(() => store.select(state => state.foo.bar)); // $ExpectType Observable<any>
    assertType(() => store.select({ foo: 'bar' })); // $ExpectError
    assertType(() => store.select()); // $ExpectError

    assertType(() => store.selectOnce(TodoState.getTodo)); // $ExpectType Observable<string[]>
    assertType(() => store.selectOnce<string[]>(TodoState)); // $ExpectType Observable<string[]>
    assertType(() => store.selectOnce(state => state.foo.bar)); // $ExpectType Observable<any>
    assertType(() => store.selectOnce({ foo: 'bar' })); // $ExpectError
    assertType(() => store.selectOnce()); // $ExpectError

    assertType(() => store.selectSnapshot(TodoState.getTodo)); // $ExpectType string[]
    assertType(() => store.selectSnapshot<string[]>(TodoState)); // $ExpectType string[]
    assertType(() => store.selectSnapshot(state => state.foo.bar)); // $ExpectType any
    assertType(() => store.selectSnapshot({ foo: 'bar' })); // $ExpectError
    assertType(() => store.selectSnapshot()); // $ExpectError
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
});
