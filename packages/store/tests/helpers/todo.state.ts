import { Injectable } from '@angular/core';
import { State, Action, Selector } from '../../src/public_api';

export class AddTodo {
  static readonly type = 'ADD_TODO';

  constructor(public readonly todo: string) {}
}
export class RemoveTodo {
  static readonly type = 'REMOVE_TODO';

  constructor(public readonly index: number) {}
}

@State<string[]>({
  name: 'todos',
  defaults: []
})
@Injectable()
export class TodoState {
  @Selector()
  static getTodos(state: string[]) {
    return state;
  }

  @Action(AddTodo)
  addTodo(state: string[], action: AddTodo) {
    return [action.todo, ...state];
  }

  @Action(RemoveTodo)
  removeTodo(state: string[], action: RemoveTodo) {
    return state.filter((_, index) => index !== action.index);
  }
}
