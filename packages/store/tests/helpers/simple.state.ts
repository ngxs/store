import { State, Action } from '../../src/public_api';

export class UpdateValue {
  static readonly type = 'UPDATE_VALUE';

  constructor(public readonly value: string) {}
}

@State<string>({
  name: 'simple',
  defaults: ''
})
export class SimpleState {
  @Action(UpdateValue)
  updateValue(state: string, action: UpdateValue) {
    return action.value;
  }
}
