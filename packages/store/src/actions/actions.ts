import { StaticAction } from './symbols';

/**
 * Init action
 */
@StaticAction()
export class InitState {
  static get type() {
    return '@@INIT';
  }
}

/**
 * Update action
 */
@StaticAction()
export class UpdateState {
  static get type() {
    return '@@UPDATE_STATE';
  }
}
