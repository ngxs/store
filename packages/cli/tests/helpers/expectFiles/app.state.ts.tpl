import { State, Action, StateContext } from '@ngxs/store';
import { AppAction } from './app.actions';

export class AppStateModel {
  public items: string[];
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    items: []
  }
})
export class AppState {
  @Action(AppAction)
  add(ctx: StateContext<AppStateModel>, action: AppAction) {
    const state = ctx.getState();
    ctx.setState({ items: [ ...state.items, action.payload ] });
  }
}
