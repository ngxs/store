import { ensureStoreMetadata } from './internals';

export function Mutation(mutation) {
  return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
    const meta = ensureStoreMetadata(target.constructor);
    meta.mutations[mutation.name] = {
      fn: name,
      type: mutation.name
    };
  };
}
