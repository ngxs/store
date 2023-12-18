import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetAuthData } from './auth.actions';

export interface AuthenticationStateModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  roles: string[];
}

@State<AuthenticationStateModel>({
  name: 'authState',
  defaults: {
    id: '',
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    roles: []
  }
})
@Injectable()
export class AuthState {
  @Selector()
  static getAuthData(state: AuthenticationStateModel): AuthenticationStateModel {
    return AuthState.getInstanceState(state);
  }

  private static setInstanceState(state: AuthenticationStateModel): AuthenticationStateModel {
    return { ...state };
  }

  private static getInstanceState(state: AuthenticationStateModel): AuthenticationStateModel {
    return { ...state };
  }

  @Action(SetAuthData)
  setAuthData(
    { setState }: StateContext<AuthenticationStateModel>,
    { payload }: SetAuthData
  ) {
    setState(AuthState.setInstanceState(payload));
  }
}
