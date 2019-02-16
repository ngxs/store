/**
 * @description - this statement implements both normal interface & static interface
 */
export function StaticAction<T = ActionStaticDef>() {
  // noinspection JSUnusedLocalSymbols
  return (constructor: T) => {};
}

/**
 * @description - interface to support the old version typescript
 */
export interface ActionStaticDef {
  new (...args: any[]): void;

  /**
   * @description - support typescript 2
   * Not necessary to declare the type in this way in your code.
   * See https://github.com/ngxs/store/pull/644#issuecomment-436003138
   * If the class doesn't have that field it won't compile
   */
  readonly type: string;
}

export interface ActionDef<T = any, U = any> {
  type: string;
  new (...args: T[]): U;
}

export type ActionType = ActionDef | { type: string };

/**
 * Actions that can be provided in a action decorator.
 */
export interface ActionOptions {
  /**
   * Cancel the previous uncompleted observable(s).
   */
  cancelUncompleted?: boolean;
}
