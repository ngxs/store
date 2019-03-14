export class ActionStatic {
  public static type: string;
}

export interface ActionClass<T = any, U = any> {
  type: string;

  new (...args: T[]): U;
}

export interface ActionLiteral {
  type: string;
}

export type ActionType<T = any, U = any> = ActionClass<T, U> | ActionLiteral | ActionStatic;

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
