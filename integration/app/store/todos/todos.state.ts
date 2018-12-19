import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { TodoState } from '@integration/store/todos/todo/todo.state';
import { Pizza, TodoStateModel } from '@integration/store/todos/todos.model';
import { LoadData, SetPrefix } from '@integration/store/todos/todos.actions';

@State<TodoStateModel>({
  name: 'todos',
  defaults: {
    todo: [],
    pizza: { model: undefined }
  },
  children: [TodoState]
})
export class TodosState {
  @Selector()
  public static pizza(state: TodoStateModel): Pizza {
    return state.pizza;
  }

  @Action(SetPrefix)
  public setPrefix({ getState, setState, patchState }: StateContext<TodoStateModel>) {
    const state = getState();
    const pizza1 = state.pizza.model.toppings;
    patchState({ pizza: { model: { toppings: 'Mr. ' + pizza1 } } });
  }

  @Action(LoadData)
  public loadData({ patchState }: StateContext<TodoStateModel>) {
    const data = { toppings: 'pineapple', crust: 'medium', extras: [false, false, true] };
    return of(data).pipe(tap(values => patchState({ pizza: { model: { ...values } } })));
  }
}
