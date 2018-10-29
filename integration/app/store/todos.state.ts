import { Action, Selector, State } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TodoState } from './todo.state';

export class TodoStateModel {
  todo: string[];
  pizza: { model: any };
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
  children: [TodoState],
  providedIn: 'ngxsRoot'
})
export class TodosState {
  @Selector()
  static pizza(state: TodoStateModel) {
    return state.pizza;
  }

  @Action(SetPrefix)
  setPrefix({ getState, setState, patchState }) {
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
  loadData({ patchState }) {
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
