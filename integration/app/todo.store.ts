import { Store, Mutation } from 'ngxs';

export class AddTodo {
  constructor(public readonly payload: string) {}
}

export class RemoveTodo {
  constructor(public readonly payload: number) {}
}

@Store<string[]>({
  name: 'todos',
  defaults: []
})
export class TodoStore {
  @Mutation(AddTodo)
  addTodo(state: string[], action: AddTodo) {
    return [action.payload, ...state];
  }

  @Mutation(RemoveTodo)
  removeTodo(state: string[], action: RemoveTodo) {
    return state.filter((_, i) => i !== action.payload);
  }
}
