import { NgxsHmrSnapshot } from '../symbols';

export class HmrBeforeDestroyAction {
  static type = '@@HMR_BEFORE_DESTROY';
  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
