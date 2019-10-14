import { PlainObject } from '@ngxs/store/internals';
import { NgxsAction } from './symbols';
import { RequiredType } from './utils';

/**
 * @public
 * Init action
 */
@RequiredType<NgxsAction>()
export class InitState {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '@@INIT';
  }
}

/**
 * @public
 * Update action
 */
@RequiredType<NgxsAction>()
export class UpdateState {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '@@UPDATE_STATE';
  }

  constructor(public addedStates?: PlainObject) {}
}
