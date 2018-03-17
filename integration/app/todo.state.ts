import { State, Action, StateContext } from 'ngxs';

export class AddTodo {
  constructor(public readonly payload: string) {}
}

export class RemoveTodo {
  constructor(public readonly payload: number) {}
}

@State<string[]>({
  name: 'todos',
  defaults: []
})
export class TodoState {
  @Action(AddTodo)
  addTodo({ state, setState }: StateContext<string[]>, { payload }: AddTodo) {
    setState([payload, ...state]);
  }

  @Action(RemoveTodo)
  removeTodo({ state, setState }: StateContext<string[]>, { payload }: RemoveTodo) {
    setState(state.filter((_, i) => i !== payload));
  }
}
