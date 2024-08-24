import { TodoModel } from '../types/todo';

export class GetTodos {
  static readonly type = '[Todo] Get';
}

// export class UpdateComplete {
//   static readonly type = '[Todo] Update complete';
//   constructor(
//     public id: number,
//     public todo: TodoModel,
//   ) {}
// }

// export class AddTodo {
//   static readonly type = '[Todo] Add';
//   constructor(public todoName: string) {}
// }
