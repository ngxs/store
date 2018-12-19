export interface Pizza<T = any> {
  model: T;
}

export class TodoStateModel {
  public todo: string[];
  public pizza: Pizza;
}

export const TODOS_STORAGE_KEY = 'todos.todo';
