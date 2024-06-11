import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetUser } from './user.actions';

export interface UserStateModel {
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

@State<UserStateModel>({
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
@Injectable()
export class UserState {
  @Selector()
  static getUser(state: UserStateModel): UserStateModel {
    return state;
  }

  @Action(SetUser)
  setUser(ctx: StateContext<UserStateModel>, { payload }: SetUser) {
    ctx.setState(payload);
  }
}
