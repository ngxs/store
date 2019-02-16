import { StaticAction } from '@ngxs/store';
import { NgxsHmrSnapshot } from '../symbols';

@StaticAction()
export class HmrBeforeDestroyAction {
  static get type() {
    return '@@HMR_BEFORE_DESTROY';
  }

  constructor(public payload: Partial<NgxsHmrSnapshot>) {}
}
