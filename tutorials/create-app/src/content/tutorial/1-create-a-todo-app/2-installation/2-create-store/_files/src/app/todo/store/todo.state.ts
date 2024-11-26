import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { TodoService } from '../todo.service';
import { TodoModel } from '../types/todo';

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
}
