import { Injectable } from '@angular/core';
import { State, Action, Selector, StateContext } from '../../src/public_api';

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
  addTodo(ctx: StateContext<string[]>, action: AddTodo) {
    const state = ctx.getState();
    ctx.setState([action.todo, ...state]);
  }

  @Action(RemoveTodo)
  removeTodo(ctx: StateContext<string[]>, action: RemoveTodo) {
    const state = ctx.getState();
    ctx.setState(state.filter((_, index) => index !== action.index));
  }
}
