import { ensureStoreMetadata } from './internals';
import { ActionOptions } from './symbols';

export class ActionToken {
  private readonly stamp = Date.now();

  constructor(public readonly desc: string) {}

  toString() {
    return `ActionToken ${this.desc} ${this.stamp}`;
  }
}

/**
 * Decorates a method with a action information.
 */
export function Action(actions: any | any[], options?: ActionOptions) {
  return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
    const meta = ensureStoreMetadata(target.constructor);

    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    for (const action of actions) {
      action.type = action.type || new ActionToken(action.name);

      if (!meta.actions[action.type]) {
        meta.actions[action.type] = [];
      }

      meta.actions[action.type].push({
        fn: name,
        options: options || {},
        type: action.type
      });
    }
  };
}
