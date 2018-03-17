import { TodoStateModel, TodosState, TodoState } from './todo.state';

export interface AppState {
  todos: TodoStateModel;
}

export const states = [TodosState, TodoState];
