import { ensureStoreMetadata } from './internals';
import { ActionOptions, StateContext } from './symbols';

/**
 * A way to create unique identifiers for types
 */
export class ActionToken {
  static counter = 0;

  private readonly stamp: number;
  private readonly description: string;

  constructor(public readonly desc: string) {
    ActionToken.counter++;

    this.stamp = ActionToken.counter;
    this.description = `ActionToken ${this.desc} ${this.stamp}`;
  }

  toString(): string {
    return this.description;
  }
}

export class ActionModel {
  type?: string | ActionToken;
  name: string;
}

export type ActionDescriptor = TypedPropertyDescriptor<(c?: StateContext<any>, a?: any) => any>;

/**
 * Decorates a method with a action information.
 *
 * All Actions passed in here will be assigned a type token if not type is defined
 */
export function Action(actions: ActionModel | ActionModel[], options?: ActionOptions) {
  return function(target: any, name: string, descriptor: ActionDescriptor) {
    const meta = ensureStoreMetadata(target.constructor);

    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    for (const action of actions) {
      if (!action.type) {
        action.type = new ActionToken(action.name);
      }

      const type = action.type.toString();

      if (!meta.actions[type]) {
        meta.actions[type] = [];
      }

      meta.actions[type].push({
        fn: name,
        options: options || {},
        type
      });
    }
  };
}
