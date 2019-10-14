import { RequiredType, runtimeCheckMissingType } from './utils';

/**
 * @public
 */
export interface NgxsAction<T = any, U = any> {
  type: string;
  new?(...args: T[]): U;
}

/**
 * @public
 */
@RequiredType<NgxsAction>()
export abstract class AbstractAction<T = any> {
  public static type: string = null!;
  public type: string;

  constructor(...args: any[]);
  constructor(public payload?: T) {
    runtimeCheckMissingType(this);
  }
}

/**
 * @public
 */
export type ActionType<T = any, U = T> = NgxsAction<T, U> | AbstractAction<T>;

/**
 * @public
 * Actions that can be provided in a action decorator.
 */
export interface ActionOptions {
  /**
   * Cancel the previous uncompleted observable(s).
   */
  cancelUncompleted?: boolean;
}

/**
 * @private
 */
export interface ActionHandlerMetaData {
  fn: string | symbol;
  options: ActionOptions;
  type: string;
}
