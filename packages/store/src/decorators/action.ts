import { ensureStoreMetadata } from '../internal/internals';
import { ActionType, ActionOptions } from '../actions/symbols';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../configs/messages.config';

/**
 * Decorates a method with a action information.
 */
export function Action(
  actions: ActionType | ActionType[],
  options?: ActionOptions
): MethodDecorator {
  return (target: any, name: string | symbol): void => {
    const isStaticMethod = target.hasOwnProperty('prototype');

    if (isStaticMethod) {
      throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.ACTION_DECORATOR]());
    }

    const meta = ensureStoreMetadata(target.constructor);

    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    for (const action of actions) {
      const type = action.type;

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
