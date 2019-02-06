import { NgxsHmrSnapshot } from '../symbols';

export class HmrInitAction {
  static type = '@@HMR_INIT';
  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
