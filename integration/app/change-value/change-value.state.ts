import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ChangeValues, ChangeValuesModel } from './change-value.actions';

@State<ChangeValuesModel>({
  name: 'values',
  defaults: new ChangeValuesModel()
})
export class ChangeValuesState {
  @Selector()
  static getValues(state: ChangeValuesModel) {
    return state;
  }

  @Action(ChangeValues)
  add({ patchState }: StateContext<ChangeValuesModel>, { payload }: ChangeValues) {
    patchState(payload);
  }
}
