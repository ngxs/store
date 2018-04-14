import { ensureStoreMetadata, ActionHandlerMetaData } from './internals';
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
      const type: string = action.type;

      if (!action.type) {
        throw new Error(`Action ${action.name} is missing a static "type" property`);
      }

      if (!meta.actions[type]) {
        meta.actions[type] = [];
      }

      meta.actions[type].push(<ActionHandlerMetaData>{
        fn: name,
        options: options || {},
        type
      });
    }
  };
}
