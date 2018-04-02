import { ensureStoreMetadata, getTypeFromKlass } from './internals';
import { ActionOptions } from './symbols';

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
      const type = getTypeFromKlass(action);
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
