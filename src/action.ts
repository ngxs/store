import { ensureStoreMetadata } from './internals';

export function Action(action) {
  return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
    const meta = ensureStoreMetadata(target.constructor);
    meta.actions[action.name] = {
      fn: name,
      type: action.name
    };
  };
}
