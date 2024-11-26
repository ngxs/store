import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
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
        id: 1,
        title: 'Learn Angular',
        completed: true
      },
      {
        id: 2,
        title: 'Learn NGXS',
        completed: true
      },
      {
        id: 3,
        title: 'Learn NGXS Store',
        completed: true
      },
      {
        id: 4,
        title: 'Learn NGXS Selectors',
        completed: true
      },
      {
        id: 5,
        title: 'Learn NGXS Actions',
        completed: true
      },
      {
        id: 6,
        title: 'Learn NGXS Utility selectors',
        completed: false
      }
    ]
  }
})
@Injectable()
export class TodoState {
  private readonly _todoService = inject(TodoService);

  @Selector()
  static getState(state: TodoStateModel) {
    return state;
  }

  @Action(GetTodos)
  async get(ctx: StateContext<TodoStateModel>) {
    const todoItems = await firstValueFrom(this._todoService.get());
    ctx.setState({
      todos: todoItems
    });
  }

  // @Action(UpdateComplete)
  // async updateComplete(
  //   ctx: StateContext<TodoStateModel>,
  //   { id, todo }: UpdateComplete,
  // ) {
  //   const state = ctx.getState();

  //   // update the todo item without mutating the state
  //   const updatedTodoItems = state.todos.map((item) => {
  //     if (item.id === id) {
  //       return {
  //         ...item,
  //         completed: !item.completed,
  //       };
  //     }

  //     return item;
  //   });

  //   ctx.setState({
  //     todos: updatedTodoItems,
  //   });
  // }

  // @Action(AddTodo)
  // async add(ctx: StateContext<TodoStateModel>, { todoName }: AddTodo) {
  //   const newTodoItem = await firstValueFrom(
  //     this._todoService.create(todoName),
  //   );
  //   ctx.patchState({
  //     todos: [newTodoItem, ...ctx.getState().todos],
  //   });
  // }
}
