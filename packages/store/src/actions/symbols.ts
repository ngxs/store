export interface ActionDef<T = any, U = any> {
  type: string;

  new (...args: T[]): U;
}

export type ActionType = ActionDef | { type: string; payload?: any; [key: string]: any };

/**
 * Actions that can be provided in a action decorator.
 */
export interface ActionOptions {
  /**
   * Cancel the previous uncompleted observable(s).
   */
  cancelUncompleted?: boolean;
}

export interface ActionHandlerMetaData {
  fn: string | symbol;
  options: ActionOptions;
  type: string;
}
