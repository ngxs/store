import { ensureStoreMetadata, uuid } from './internals';
import { ActionOptions } from './symbols';

export class ActionToken {
  private readonly stamp = uuid();

  constructor(public readonly desc: string) {}

  toString(): string {
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
      if (typeof action.type === 'string') {
        action.type = new ActionToken(action.type);
      } else if (!action.type) {
        action.type = new ActionToken(action.name);
      }

      console.log(action.type.toString());

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
