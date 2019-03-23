import { NgxsHmrSnapshot } from '../symbols';

export class HmrInitAction {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '@@HMR_INIT';
  }

  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
