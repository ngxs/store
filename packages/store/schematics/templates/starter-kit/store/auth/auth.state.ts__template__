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
  name: 'authStateModule',
  defaults: {
    id: '',
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    roles: []
  }
})
export class AuthStateModule {
  @Selector()
  public static getAuthData(state: AuthenticationStateModel): AuthenticationStateModel {
    return AuthStateModule.getInstanceState(state);
  }

  private static setInstanceState(state: AuthenticationStateModel): AuthenticationStateModel {
    return { ...state };
  }

  private static getInstanceState(state: AuthenticationStateModel): AuthenticationStateModel {
    return { ...state };
  }

  @Action(SetAuthData)
  public setAuthData(
    { setState }: StateContext<AuthenticationStateModel>,
    { payload }: SetAuthData
  ) {
    setState(AuthStateModule.setInstanceState(payload));
  }
}
