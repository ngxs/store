import { ɵPlainObject } from '@ngxs/store/internals';

/**
 * Init action
 */
export class InitState {
  static readonly type = '@@INIT';
}

/**
 * Update action
 */
export class UpdateState {
  static readonly type = '@@UPDATE_STATE';

  constructor(readonly addedStates?: ɵPlainObject) {}
}
