import { Action, ActionOptions, ActionType, StateContext } from '@ngxs/store';
import { META_OPTIONS_KEY } from '@ngxs/store/src/symbols';

export function declareAction<S, A>(
  storeClass: any,
  actions: ActionType | ActionType[],
  fn: (ctx: StateContext<S>, action?: A) => any,
  options?: ActionOptions
): void {
  if (!storeClass[META_OPTIONS_KEY]) {
    throw new Error('storeClass is not a valid NGXS Store');
  }

  const methodName = getActionMethodName(actions);
  storeClass.prototype[methodName] = function(_state: any, _action: any): any {
    return fn(_state, _action);
  };

  Action(actions, options)({ constructor: storeClass }, methodName, {} as any);
}

const getActionMethodName = (actions: ActionType | ActionType[]) => {
  if (!Array.isArray(actions)) {
    actions = [actions];
  }

  const random = Math.random();
  const postfix = random.toString(36).substr(2);
  const actionNames = actions.map(a => a.type.replace(/[^a-zA-Z0-9]+/g, ''));
  const actionName = actionNames.join('_').substring(0, 128);

  return `${actionName}_${postfix}`;
};
