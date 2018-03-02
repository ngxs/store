import { ensureStoreMetadata } from './internals';

export function Mutation(mutations: any | any[]) {
  return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
    const meta = ensureStoreMetadata(target.constructor);
    if (!Array.isArray(mutations)) {
      mutations = [mutations];
    }
    for (const mutation of mutations) {
      meta.mutations[mutation.name] = {
        fn: name,
        type: mutation.name
      };
    }
  };
}
