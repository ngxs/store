import { Action, Selector, State, StateContext } from '@ngxs/store';

export class AddTodo {
  static type = 'AddTodo';

  constructor(public readonly payload: string) {}
}

export class RemoveTodo {
  static type = 'RemoveTodo';

  constructor(public readonly payload: number) {}
}

@State<string[]>({
  name: 'todo',
  defaults: []
})
export class TodoState {
  @Selector()
  static pandas(state: string[]) {
    return state.filter(s => s.indexOf('panda') > -1);
  }

  @Action(AddTodo)
  addTodo({ getState, setState }: StateContext<string[]>, { payload }: AddTodo) {
    setState([...getState(), payload]);
  }

  @Action(RemoveTodo)
  removeTodo({ getState, setState }: StateContext<string[]>, { payload }: RemoveTodo) {
    setState(getState().filter((_, i) => i !== payload));
  }
}
