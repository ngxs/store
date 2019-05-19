/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';

import { createSelector, NgxsModule, State, Store } from '../../src/public_api';
import { assertType } from './utils/assert-type';

describe('[TEST]: createSelector', () => {
  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    store = TestBed.get(Store);
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
