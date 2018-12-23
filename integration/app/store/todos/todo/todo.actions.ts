import { Todo } from '@integration/store/todos/todos.model';

export class AddTodo {
  public static type = 'AddTodo';
  constructor(public readonly payload: Todo) {}
}

export class RemoveTodo {
  public static type = 'RemoveTodo';
  constructor(public readonly payload: number) {}
}
