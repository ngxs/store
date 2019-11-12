/// <reference types="@types/jest" />
import { State, NgxsModule, StateToken, Select, Selector, Store } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { assertType } from './utils/assert-type';

describe('[TEST]: StateToken', () => {
  it('should successfully create a simple token', () => {
    // Argument of type '"hello"' is not assignable to parameter of type '"You must provide a type parameter"'.
    new StateToken('hello'); // $ExpectError
    new StateToken<string[]>('todos'); // $ExpectType StateToken<string[]>
  });

  it('should be correct provide token in state name', () => {
    const TODO_LIST_TOKEN = new StateToken<string[]>('todoList');

    @State({
      name: TODO_LIST_TOKEN, // $ExpectType StateToken<string[]>
      defaults: [] // $ExpectType never[]
    })
    class TodoListState {}

    @State<string[]>({
      name: TODO_LIST_TOKEN, // $ExpectType StateToken<string[]>
      defaults: [] // $ExpectType never[]
    })
    class TodoListState2 {}

    NgxsModule.forRoot([TodoListState, TodoListState2]);
  });

  it('should be type check defaults', () => {
    interface MyStateModel {
      hello: string;
      world: number;
    }

    const BAR_STATE_TOKEN = new StateToken<MyStateModel>('bar');

    @State({
      name: BAR_STATE_TOKEN, // $ExpectType StateToken<MyStateModel>
      defaults: {} // $ExpectError
    })
    class BarState {}

    @State({
      name: BAR_STATE_TOKEN, // $ExpectType StateToken<MyStateModel>
      defaults: { hello: 'world', world: 1 } // $ExpectType { hello: string; world: number; }
    })
    class BarState2 {}

    @State<MyStateModel>({
      name: BAR_STATE_TOKEN, // $ExpectType StateToken<MyStateModel>
      defaults: { hello: 'world', world: 1 } // $ExpectType { hello: string; world: number; }
    })
    class BarState3 {}

    const FOO_STATE_TOKEN = new StateToken<number[]>('foo');

    @State({
      name: FOO_STATE_TOKEN,
      defaults: true // $ExpectError
    })
    class FooState {}

    NgxsModule.forRoot([BarState, BarState2, BarState3, FooState]);
  });

  it('should be invalid type by state token', () => {
    const APP_STATE_TOKEN = new StateToken<{ myApp: number[] }>('app');

    @State({
      name: APP_STATE_TOKEN, // $ExpectType StateToken<{ myApp: number[]; }>
      defaults: ['1'] // $ExpectError
    })
    class AppState {}

    @State<string[]>({
      name: APP_STATE_TOKEN, // $ExpectType StateToken<{ myApp: number[]; }>
      defaults: ['2'] // $ExpectType string[]
    })
    class AppState2 {}

    const APP3_STATE_TOKEN = new StateToken<unknown>('app3');

    @State({
      name: APP3_STATE_TOKEN, // $ExpectType StateToken<unknown>
      defaults: [] // $ExpectType never[]
    })
    class AppState3 {}

    NgxsModule.forRoot([AppState, AppState2, AppState3]);
  });

  it('should be improved type safety for selector', () => {
    const TODO_LIST_TOKEN = new StateToken<string[]>('todos');

    @State({
      name: TODO_LIST_TOKEN,
      defaults: []
    })
    class TodoListState {
      @Selector([TODO_LIST_TOKEN]) // $ExpectType (state: string[]) => string[]
      static todosV1(state: string[]): string[] {
        return state;
      }

      @Selector([TODO_LIST_TOKEN]) // $ExpectError
      static todosV2(state: number): number {
        return state;
      }

      @Selector() // (state: string[]) => string[]
      static todosV3(state: string[]): string[] {
        return state;
      }

      @Selector([TodoListState, TODO_LIST_TOKEN]) // (state: string[], other: number) => number
      static todosV4(state: string[], other: number[]): number {
        return state.length + other.length;
      }
    }

    NgxsModule.forRoot([TodoListState]);
  });

  it('should be correct type checking in select', () => {
    interface MyModel {
      bar: boolean;
    }

    const FOO_TOKEN = new StateToken<MyModel>('foo');

    @State({
      name: FOO_TOKEN,
      defaults: { bar: false }
    })
    class FooState {
      @Selector([FOO_TOKEN])
      static bar(state: MyModel) {
        return state.bar;
      }
    }

    @Component({ selector: 'app' })
    class AppComponent {
      @Select() appV1$: string; // $ExpectType string
      @Select() appV2$: string; // $ExpectType string
      @Select((state: string) => state) appV3$: string; // string

      // Argument of type is not assignable to parameter of type Observable<{ foo: boolean }>
      @Select(FOO_TOKEN) appV4$: string; // $ExpectError
      @Select(FOO_TOKEN) appV5$: Observable<string>; // $ExpectError
      @Select(FOO_TOKEN) appV6$: Observable<MyModel>; // $ExpectType Observable<MyModel>

      // TODO: invalid type check
      @Select(FooState.bar) bar$: string; // $ExpectType string

      constructor(public store: Store) {}
    }

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [NgxsModule.forRoot([FooState])]
    });

    const appComponent: AppComponent = TestBed.createComponent<AppComponent>(AppComponent)
      .componentInstance;

    const snapshotByToken = appComponent.store.selectSnapshot(FOO_TOKEN);
    const snapshotByStateClass = appComponent.store.selectSnapshot(FooState);

    assertType(() => snapshotByToken); // $ExpectType MyModel
    assertType(() => snapshotByStateClass); // $ExpectType any

    const selectByToken = appComponent.store.select(FOO_TOKEN);
    const selectByStateClass = appComponent.store.select(FooState);

    assertType(() => selectByToken); // $ExpectType Observable<MyModel>
    assertType(() => selectByStateClass); // $ExpectType Observable<any>

    const selectOnceByToken = appComponent.store.selectOnce(FOO_TOKEN);
    const selectOnceByStateClass = appComponent.store.selectOnce(FooState);

    assertType(() => selectOnceByToken); // $ExpectType Observable<MyModel>
    assertType(() => selectOnceByStateClass); // $ExpectType Observable<any>
  });
});
