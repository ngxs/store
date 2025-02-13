import { inject, Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { TodoService } from '../todo.service';
import { TodoModel } from '../types/todo';
import { GetTodos } from './todo.actions';

export interface TodoStateModel {
  todos: TodoModel[];
}

@State<TodoStateModel>({
  name: 'todo',
  defaults: {
    todos: [
      {
        completed: true,
        id: 1,
        title: 'Create a new Angular app'
      },
      {
        completed: true,
        id: 1,
        title: 'fdsf sdfs fsdfsd'
      }
    ]
  }
})
@Injectable()
export class TodoState {
  private readonly _todoService = inject(TodoService);

  @Action(GetTodos)
  async get(ctx: StateContext<TodoStateModel>) {
    const todoItems = await firstValueFrom(this._todoService.get());
    ctx.setState({
      todos: todoItems
    });
  }
}
