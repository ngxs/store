export class StaticAction {
  public static type: string;
}

export interface ComplexAction<T = any, U = any> {
  type: string;

  new (...args: T[]): U;
}

export interface SimpleAction {
  type: string;
}

export type ActionType = ComplexAction | SimpleAction | StaticAction;

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
