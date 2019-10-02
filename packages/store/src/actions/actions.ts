import { PlainObject } from '@ngxs/store/internals';

/**
 * Init action
 */
export class InitState {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '@@INIT';
  }
}

/**
 * Update action
 */
export class UpdateState {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '@@UPDATE_STATE';
  }

  constructor(public addedStates?: PlainObject) {}
}
