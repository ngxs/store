import { Freeze } from '../decorators/frezee';

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
}

/**
 * Dispatch action
 */
@Freeze()
export class DispatchAction<T = any> {
  static type: string;
  constructor(public payload?: T) {}
}
