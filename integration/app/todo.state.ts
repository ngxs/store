import { State, Action, StateContext } from 'ngxs';

export class AddTodo {
  constructor(public readonly payload: string) {}
}

export class RemoveTodo {
  constructor(public readonly payload: number) {}
}

export class TodoStateModel {
  todo: string[];
}

@State<string[]>({
  name: 'todo',
  defaults: []
})
export class TodoState {
  @Action(AddTodo)
  addTodo({ state, setState }: StateContext<string[]>, { payload }: AddTodo) {
    setState([...state, payload]);
  }

  @Action(RemoveTodo)
  removeTodo({ state, setState }: StateContext<string[]>, { payload }: RemoveTodo) {
    setState(state.filter((_, i) => i !== payload));
  }
}

@State<TodoStateModel>({
  name: 'todos',
  children: [TodoState]
})
export class TodosState {}
