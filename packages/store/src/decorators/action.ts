import { ensureStoreMetadata, ObjectKeyMap } from '../internal/internals';
import {
  ActionType,
  ActionOptions,
  ActionHandlerMetaData,
  ActionClass
} from '../actions/symbols';

/**
 * Decorates a method with a action information.
 */
export function Action(actions: ActionType | ActionType[], options: ActionOptions = {}) {
  return function(target: any, fn: string): void {
    const meta = ensureStoreMetadata(target.constructor);
    const actionList: ActionType[] = !Array.isArray(actions) ? [actions] : actions;

    for (const action of actionList) {
      const type: string = (action as ActionClass).type;
      const actionsMetaData: ObjectKeyMap<ActionHandlerMetaData[]> = meta.actions;
      actionsMetaData[type] = !actionsMetaData[type] ? [] : actionsMetaData[type];
      actionsMetaData[type].push({ fn, options, type });
    }
  };
}
