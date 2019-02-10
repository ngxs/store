import { StateClass } from '../../store/src/internal/internals';

/**
 * Action to erase all state
 */
export class StateErase {
  static readonly type = '@@ERASE_STATE';
  constructor(public readonly statesToKeep?: StateClass | StateClass[]) {}
}

/**
 * Action to reset a state
 */
export class StateReset {
  static readonly type = '@@RESET_STATE';
  constructor(public readonly statesToReset: StateClass | StateClass[]) {}
}
