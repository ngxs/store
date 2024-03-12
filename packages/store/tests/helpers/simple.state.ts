import { Injectable } from '@angular/core';
import { State, Action } from '../../src/public_api';

export class UpdateValue {
  static readonly type = 'UPDATE_VALUE';

  constructor(public readonly value: string) {}
}

@State<string>({
  name: 'simple',
  defaults: ''
})
@Injectable()
export class SimpleState {
  @Action(UpdateValue)
  updateValue(_: string, action: UpdateValue) {
    return action.value;
  }
}
