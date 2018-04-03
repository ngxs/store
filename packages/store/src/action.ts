import { ensureStoreMetadata } from './internals';
import { ActionOptions } from './symbols';

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

/**
 * Decorates a method with a action information.
 */
export function Action(actions: ActionModel | ActionModel[], options?: ActionOptions) {
  return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
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
