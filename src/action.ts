import { ensureStoreMetadata } from './internals';

export function Action(actions: any | any[]) {
  return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
    const meta = ensureStoreMetadata(target.constructor);

    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    for (const action of actions) {
      meta.actions[action.type || action.name] = {
        fn: name,
        type: action.type || action.name
      };
    }
  };
}
