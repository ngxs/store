import { ActionDecorator, ActionOptions, Actions } from '@ngxs/store/src/actions/symbols';

export class FooTestTypeAction {
  public type: string;

  constructor(public payload: string) {}
}

type Decorator = ActionDecorator<Actions>;

export const ActionTypeExpect: Decorator = (
  actions: Actions,
  _: ActionOptions = {}
): Actions => actions;

export const DispatchTypeExpect = (actions: Actions): Actions => actions;
