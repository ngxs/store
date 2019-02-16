import { StaticAction } from '@ngxs/store';
import { NgxsHmrSnapshot } from '../symbols';

@StaticAction()
export class HmrInitAction {
  static get type() {
    return '@@HMR_INIT';
  }

  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
