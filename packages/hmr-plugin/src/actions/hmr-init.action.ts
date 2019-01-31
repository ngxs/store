import { NgxsHmrSnapshot } from '../symbols';

export class HmrInitAction {
  static get type() {
    return '@@HMR_INIT';
  }

  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
