import { ɵActionOptions, ɵensureStoreMetadata } from '@ngxs/store/internals';

import { ActionType } from '../actions/symbols';
import { throwActionDecoratorError } from '../configs/messages.config';

/**
 * Decorates a method with a action information.
 */
export function Action(
  actions: ActionType | ActionType[],
  options?: ɵActionOptions
): MethodDecorator {
  return (target: any, name: string | symbol): void => {
    // Caretaker note: we have still left the `typeof` condition in order to avoid
    // creating a breaking change for projects that still use the View Engine.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const isStaticMethod = target.hasOwnProperty('prototype');

      if (isStaticMethod) {
        throwActionDecoratorError();
      }
    }

    const meta = ɵensureStoreMetadata(target.constructor);

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
