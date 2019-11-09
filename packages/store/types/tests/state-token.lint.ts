/// <reference types="@types/jest" />
import { State, NgxsModule, StateToken, Select, Selector } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

describe('[TEST]: StateToken', () => {
  it('should be provide generic', () => {
    // Argument of type '"hello"' is not assignable to parameter of type '"You must provide a type parameter"'.
    StateToken.create('hello'); // $ExpectError
    StateToken.create<string[]>('todos'); // $ExpectType StateToken<string[]>
  });

  it('should be correct provide token in state name', () => {
    const TODO_LIST_TOKEN = StateToken.create<string[]>('todoList');

    @State<string[]>({
      name: TODO_LIST_TOKEN,
      defaults: []
    })
    class TodoListState { }

    NgxsModule.forRoot([TodoListState]);
  });

  it('should be type check defaults', () => {
    interface MyStateModel {
      hello: string;
      world: number;
    }

    const BAR_STATE_TOKEN = StateToken.create<MyStateModel>('bar');

    @State({
      // Type {} is not assignable to type MyStateModel
      name: BAR_STATE_TOKEN,
      defaults: {} // $ExpectError
    })
    class BarState { }

    const FOO_STATE_TOKEN = StateToken.create<number[]>('foo');

    @State({
      // Type {} is not assignable to type number[]
      name: FOO_STATE_TOKEN,
      defaults: true // $ExpectError
    })
    class FooState { }

    NgxsModule.forRoot([BarState, FooState]);
  });

  it('should be invalid type by state token', () => {
    const APP_STATE_TOKEN = StateToken.create<{ myApp: number[] }>('app');

    @State<string[]>({
      // Type StateToken<{ myApp: number[] }> is not assignable to type StateToken<string[]>
      name: APP_STATE_TOKEN, // $ExpectError
      defaults: []
    })
    class AppState { }

    NgxsModule.forRoot([AppState]);
  });

  it('should be improved type safety for selector', () => {
    const TODO_LIST_TOKEN = StateToken.create<string[]>('todos');

    @State({
      name: TODO_LIST_TOKEN,
      defaults: []
    })
    class TodoListState {
      @Selector([TODO_LIST_TOKEN]) // $ExpectType (state: string[]) => string[]
      public static todosV1(state: string[]): string[] {
        return state;
      }

      @Selector([TODO_LIST_TOKEN]) // $ExpectError
      public static todosV2(state: number): number {
        return state;
      }

      @Selector() // (state: string[]) => string[]
      public static todosV3(state: string[]): string[] {
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

    const FOO_TOKEN = StateToken.create<MyModel>('foo');

    @State({
      name: FOO_TOKEN,
      defaults: { bar: false }
    })
    class FooState { }

    @Component({ selector: 'app' })
    class AppComponent {
      @Select() public appV1$: string; // $ExpectType string
      @Select() public appV2$: string; // $ExpectType string
      @Select((state: string) => state) public appV3$: string; // string

      // Argument of type is not assignable to parameter of type Observable<{ foo: boolean }>
      @Select(FOO_TOKEN) public appV4$: string; // $ExpectError
      @Select(FOO_TOKEN) public appV5$: Observable<string>; // $ExpectError
      @Select(FOO_TOKEN) public appV6$: Observable<MyModel>; // $ExpectType Observable<MyModel>
    }

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [NgxsModule.forRoot([FooState])]
    });
  });
});
