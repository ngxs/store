import { Action, Selector, State, StateContext, NgxsOnInit } from '@ngxs/store';
import { AddTodo, RemoveTodo } from '@integration/store/todos/todo/todo.actions';

@State<string[]>({
  name: 'todo',
  defaults: []
})
export class TodoState implements NgxsOnInit {
  @Selector()
  public static pandas(state: string[]): string[] {
    return state.filter(s => s.indexOf('panda') > -1);
  }

  public ngxsOnInit({ getState, setState }: StateContext<string[]>) {
    const state: string[] = getState();
    const payload = 'NgxsOnInit todo';
    if (!state.includes(payload)) {
      setState([...state, payload]);
    }
  }

  @Action(AddTodo)
  public addTodo({ getState, setState }: StateContext<string[]>, { payload }: AddTodo) {
    setState(state => [...state, payload]);
  }

  @Action(RemoveTodo)
  public removeTodo({ getState, setState }: StateContext<string[]>, { payload }: RemoveTodo) {
    setState(state => state.filter((_, i) => i !== payload));
  }
}
