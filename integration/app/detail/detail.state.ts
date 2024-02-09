import { Selector, State } from '@ngxs/store';
import { Injectable } from '@angular/core';

export interface DetailStateModel {
  foo: boolean;
}

@State({
  name: 'detail',
  defaults: { foo: true }
})
@Injectable()
export class DetailState {
  @Selector()
  static getDetailState(state: DetailStateModel) {
    return state;
  }
}
