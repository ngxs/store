import { PersonStateModel } from './user.state';

export class SetUser {
  public static readonly type = '[SetUser] action';
  constructor(public payload: PersonStateModel) {}
}
