import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Pizza, TodoStateModel } from '@integration/store/todos/todos.model';
import { LoadData, SetPrefix } from '@integration/store/todos/todos.actions';
import { Injectable } from '@angular/core';
import { ListState } from '@integration/list/list.state';

const TODOS_TOKEN: StateToken<TodoStateModel> = new StateToken('todos');

@State<TodoStateModel>({
  name: TODOS_TOKEN,
  defaults: {
    todo: [],
    pizza: { model: undefined }
  }
})
@Injectable()
export class TodosState {
  @Selector()
  static getPizza(state: TodoStateModel): Pizza {
    return state.pizza;
  }

  @Selector([ListState.getHello])
  static getInjected(state: TodoStateModel, hello: string): string {
    if (state.todo == null || hello == null) {
      return 'container injection failed or is disabled';
    }
    return `${hello}! i have ${state.todo.length} todos`;
  }

  @Action(SetPrefix)
  setPrefix({ setState }: StateContext<TodoStateModel>) {
    setState(
      patch({
        pizza: patch({
          model: patch({
            toppings: (topping: any) => 'Mr. ' + topping
          })
        })
      })
    );
  }

  @Action(LoadData)
  loadData({ patchState }: StateContext<TodoStateModel>) {
    const data = { toppings: 'pineapple', crust: 'medium', extras: [false, false, true] };
    return of(data).pipe(tap(values => patchState({ pizza: { model: { ...values } } })));
  }
}
