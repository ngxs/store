export const TODOS_STORAGE_KEY = 'todos.todo';
export type Todo = string;

export interface Pizza<T = any> {
  model: T;
}

export class TodoStateModel {
  public todo: string[];
  public pizza: Pizza;
}

export interface Extras {
  name: string;
  selected: boolean;
}
