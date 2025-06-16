import { Todo } from '@integration/store/todos/todos.model';

export class AddTodo {
  static type = 'AddTodo';
  constructor(readonly payload: Todo) {}
}

export class RemoveTodo {
  static type = 'RemoveTodo';
  constructor(readonly payload: number) {}
}
