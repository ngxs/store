import { NgxsHmrSnapshot } from '../symbols';

export class HmrBeforeDestroyAction {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '@@HMR_BEFORE_DESTROY';
  }

  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
