import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { TodoState } from '@integration/store/todos/todo/todo.state';
import { Pizza, TodoStateModel } from '@integration/store/todos/todos.model';
import { LoadData, SetPrefix } from '@integration/store/todos/todos.actions';
import { Injectable } from '@angular/core';

const TODOS_TOKEN: StateToken<TodoStateModel> = new StateToken('todos');

@State<TodoStateModel>({
  name: TODOS_TOKEN,
  defaults: {
    todo: [],
    pizza: { model: undefined }
  },
  children: [TodoState]
})
@Injectable()
export class TodosState {
  @Selector()
  public static pizza(state: TodoStateModel): Pizza {
    return state.pizza;
  }

  @Action(SetPrefix)
  public setPrefix({ setState }: StateContext<TodoStateModel>) {
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
  public loadData({ patchState }: StateContext<TodoStateModel>) {
    const data = { toppings: 'pineapple', crust: 'medium', extras: [false, false, true] };
    return of(data).pipe(tap(values => patchState({ pizza: { model: { ...values } } })));
  }
}
