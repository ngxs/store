import { TodoStateModel, TodosState, TodoState } from './todo.state';
import { CounterState, CounterStateModel } from './counter.state';

export interface AppState {
  counter: CounterStateModel;
  todos: TodoStateModel;
}

export const states = [TodosState, TodoState, CounterState];
