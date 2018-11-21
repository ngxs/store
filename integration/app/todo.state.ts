import { State, Action, StateContext, Selector } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export class AddTodo {
  static type = 'AddTodo';

  constructor(public readonly payload: string) {}
}

export class RemoveTodo {
  static type = 'RemoveTodo';

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

export class SetPrefix {
  static type = 'SetPrefix';
}

export class LoadData {
  static type = 'LoadData';
}

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
  static pizza(state: TodoStateModel) {
    return state.pizza;
  }

  @Action(SetPrefix)
  setPrefix({ getState, setState, patchState }: StateContext<TodoStateModel>) {
    const state = getState();
    const pizza1 = state.pizza.model.toppings;
    patchState({
      pizza: {
        model: {
          toppings: 'Mr. ' + pizza1
        }
      }
    });
  }

  @Action(LoadData)
  loadData({ patchState }: StateContext<TodoStateModel>) {
    const data = {
      toppings: 'pineapple',
      crust: 'medium',
      extras: [false, false, true]
    };
    return of(data).pipe(
      tap((vals: any) => {
        patchState({
          pizza: {
            model: {
              ...vals
            }
          }
        });
      })
    );
  }
}
