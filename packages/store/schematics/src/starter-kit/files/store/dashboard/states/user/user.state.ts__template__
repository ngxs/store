import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetUser } from './user.actions';

export interface PersonStateModel {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  positionId: string;
  positionName: string;
  departmentCode: string;
  departmentName: string;
}

@State<PersonStateModel>({
  name: 'user',
  defaults: {
    userId: '',
    email: '',
    firstName: '',
    lastName: '',
    fullName: '',
    positionId: '',
    positionName: '',
    departmentCode: '',
    departmentName: ''
  }
})
export class UserState {
  @Selector()
  public static getUser(state: PersonStateModel): PersonStateModel {
    return state;
  }

  @Action(SetUser)
  public setUser(ctx: StateContext<PersonStateModel>, { payload }: SetUser) {
    ctx.setState(payload);
  }
}
