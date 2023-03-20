/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { createSelector, NgxsModule, State, Store, Selector } from '@ngxs/store';

import { assertType } from './utils/assert-type';

describe('[TEST]: createSelector', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()],
    });

    store = TestBed.get(Store);
  });

  it('should be correct detect type with createSelector', () => {
    @State<string[]>({
      name: 'todo',
      defaults: [],
    })
    class TodoState {
      // $ExpectType () => (state: string[]) => string[]
      static todoA() {
        return createSelector([TodoState], (state: string[]) =>
          state.map((todo) => todo).reverse()
        );
      }

      // $ExpectType () => (s1: any) => any
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
            getSelectorOptions: () => ({}),
          }
        );
      }
    }

    assertType(() => store.selectSnapshot(TodoState.todoA())); // $ExpectType string[]
    assertType(() => store.selectSnapshot(TodoState.todoA)); // $ExpectType (state: string[]) => string[]
    assertType(() => store.selectSnapshot(TodoState.todoB())); // $ExpectType any
    assertType(() => store.selectSnapshot(TodoState.todoB)); // $ExpectType (s1: any) => any
    assertType(() => store.selectSnapshot(TodoState.todoC())); // $ExpectType string
    assertType(() => store.selectSnapshot(TodoState.todoC)); // $ExpectType (args: number) => string
    assertType(() => store.selectSnapshot(TodoState.todoD())); // $ExpectType Observable<number>
    assertType(() => store.selectSnapshot(TodoState.todoD)); // $ExpectType (state: Observable<number>) => Observable<number>
  });

  it('should get inferrable type from createSelector', () => {
    interface TestStateModel {
      prop: string;
    }

    @State<TestStateModel>({
      name: 'state',
      defaults: {
        prop: null!,
      },
    })
    class TestState {
      @Selector()
      static foo(state: TestStateModel) {
        return state.prop;
      }
    }

    const selectTestStateModel = createSelector(
      [TestState],
      (state: TestStateModel) => state // $ExpectType (state: TestStateModel) => TestStateModel
    );

    assertType(() => selectTestStateModel); // $ExpectType (state: TestStateModel) => TestStateModel

    const selectStateModelProp = createSelector(
      [selectTestStateModel],
      (model) => model.prop // $ExpectType (model: TestStateModel) => string
    );

    assertType(() => selectStateModelProp); // $ExpectType (model: TestStateModel) => string

    const selectStateModelPropBySelector = createSelector(
      [TestState.foo],
      (state) => state // $ExpectType (state: string) => string
    );

    assertType(() => selectStateModelPropBySelector); // $ExpectType (state: string) => string

    const selectTestStateModelWithSomeOther = createSelector(
      [TestState, TestState.foo],
      (state, someOtherData) => ({ state, someOtherData }) // $ExpectType (state: any, someOtherData: string) => { state: any; someOtherData: string; }
    );

    assertType(() => selectTestStateModelWithSomeOther); // $ExpectType (state: any, someOtherData: string) => { state: any; someOtherData: string; }

    const mixinSelector = createSelector(
      [selectTestStateModel, TestState.foo, selectTestStateModelWithSomeOther],
      (a, b, c) => ({ a, b, c }) // $ExpectType (a: TestStateModel, b: string, c: { state: any; someOtherData: string; }) => { a: TestStateModel; b: string; c: { state: any; someOtherData: string; }; }
    );

    assertType(() => mixinSelector); // $ExpectType (a: TestStateModel, b: string, c: { state: any; someOtherData: string; }) => { a: TestStateModel; b: string; c: { state: any; someOtherData: string; }; }
  });

  it('should infer projector parameter types from selectors', () => {
    const val = 'x' as const;
    const a = () => ['a'] as const;
    const b = () => ['b'] as const;
    const c = () => ['c'] as const;
    const d = () => ['d'] as const;
    const e = () => ['e'] as const;
    const f = () => ['f'] as const;
    const g = () => ['g'] as const;
    const h = () => ['h'] as const;

    function assertReturnType<T extends (...args: any) => any>(fn: T): ReturnType<T> {
      return null as unknown as ReturnType<T>;
    }

    assertReturnType(createSelector([a],(a) => [...a] as const)); // $ExpectType readonly ["a"]
    assertReturnType(createSelector([a, b],(a, b) => [...a, ...b] as const)); // $ExpectType readonly ["a", "b"]
    assertReturnType(createSelector([a, b, c],(a, b, c) => [...a, ...b, ...c] as const)); // $ExpectType readonly ["a", "b", "c"]
    assertReturnType(createSelector([a, b, c, d],(a, b, c, d) => [...a, ...b, ...c, ...d] as const )); // $ExpectType readonly ["a", "b", "c", "d"]
    assertReturnType(createSelector([a, b, c, d, e],(a, b, c, d, e) => [...a, ...b, ...c, ...d, ...e] as const)); // $ExpectType readonly ["a", "b", "c", "d", "e"]
    assertReturnType(createSelector([a, b, c, d, e, f],(a, b, c, d, e, f) => [...a, ...b, ...c, ...d, ...e, ...f] as const)); // $ExpectType readonly ["a", "b", "c", "d", "e", "f"]
    assertReturnType(createSelector([a, b, c, d, e, f, g],(a, b, c, d, e, f, g) => [...a, ...b, ...c, ...d, ...e, ...f, ...g] as const)); // $ExpectType readonly ["a", "b", "c", "d", "e", "f", "g"]
    assertReturnType(createSelector([a, b, c, d, e, f, g, h],(a, b, c, d, e, f, g, h) => [...a, ...b, ...c, ...d, ...e, ...f, ...g, ...h] as const)); // $ExpectType readonly ["a", "b", "c", "d", "e", "f", "g", "h"]
  });
});
