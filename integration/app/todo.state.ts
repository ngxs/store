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
  addTodo({ getState, setState }: StateContext<string[]>, { payload }: AddTodo) {
    setState([...getState(), payload]);
  }

  @Action(RemoveTodo)
  removeTodo({ getState, setState }: StateContext<string[]>, { payload }: RemoveTodo) {
    setState(getState().filter((_, i) => i !== payload));
  }
}

@State<TodoStateModel>({
  name: 'todos',
  children: [TodoState]
})
export class TodosState {}
