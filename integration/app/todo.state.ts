import { State, Action, StateContext, Selector } from '@ngxs/store';

export class AddTodo {
  constructor(public readonly payload: string) {}
}

export class RemoveTodo {
  constructor(public readonly payload: number) {}
}

export class TodoStateModel {
  todo: string[];
  pizza: { model: any };
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

export class SetPrefix {}

@State<TodoStateModel>({
  name: 'todos',
  defaults: {
    todo: [],
    pizza: { model: undefined }
  },
  children: [TodoState]
})
export class TodosState {
  onInit() {
    console.log('here');
  }

  @Action(SetPrefix)
  setPrefix({ getState, setState, patchState }) {
    const state = getState();
    const pizza = state.pizza.model.toppings;
    patchState({ pizza: { model: { toppings: 'Mr. ' + pizza } } });
  }
}
