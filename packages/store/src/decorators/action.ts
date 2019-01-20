import { ensureStoreMetadata } from '../internal/internals';
import { ActionOptions, ActionDef } from '../symbols';

/**
 * Decorates a method with a action information.
 */
export function Action(actions: ActionDef | ActionDef[], options?: ActionOptions) {
  return function(target: any, name: string, _descriptor: TypedPropertyDescriptor<any>) {
    const meta = ensureStoreMetadata(target.constructor);

    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    for (const action of actions) {
      const type = action.type;

      if (!action.type) {
        throw new Error(`Action ${action.name} is missing a static "type" property`);
      }

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
