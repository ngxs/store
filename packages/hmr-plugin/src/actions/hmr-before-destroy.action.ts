import { NgxsHmrSnapshot } from '../symbols';

export class HmrBeforeDestroyAction {
  static get type() {
    return '@@HMR_BEFORE_DESTROY';
  }

  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
