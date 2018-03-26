import { ensureStoreMetadata, getTypeFromKlass } from './internals';

/**
 * Decorates a method with a action information.
 */
export function Action(actions: any | any[]) {
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
        type
      });
    }
  };
}
