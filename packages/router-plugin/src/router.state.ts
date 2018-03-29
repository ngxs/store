import { RouterStateSnapshot } from '@angular/router';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { RouterAction, RouterCancel, RouterError, RouterNavigation } from './router.actions';

export type RouterStateModel<T = RouterStateSnapshot> = {
  state: T;
  navigationId: number;
};

@State<RouterStateModel>({
  name: 'router',
  defaults: {
    state: undefined,
    navigationId: undefined
  }
})
export class RouterState {
  @Selector()
  static state(state: RouterStateModel) {
    return state && state.state;
  }

  @Selector()
  static url(state: RouterStateModel) {
    return state && state.state && state.state.url;
  }

  @Selector()
  static paramMap(state: RouterStateModel) {
    return state && state.state && state.state.root && state.state.root.paramMap;
  }

  @Action([RouterNavigation, RouterError, RouterCancel])
  routerAction(ctx: StateContext<RouterStateModel>, action: RouterAction<any, RouterStateSnapshot>) {
    console.log('router action', action);
    return {
      ...ctx.getState(),
      state: action.payload.routerState,
      navigationId: action.payload.event.id
    };
  }
}
