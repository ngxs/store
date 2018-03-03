import { ensureStoreMetadata, getTypeFromKlass } from './internals';

/**
 * Decorates a method with the mutation information
 */
export function Mutation(mutations: any | any[]) {
  return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
    const meta = ensureStoreMetadata(target.constructor);

    if (!Array.isArray(mutations)) {
      mutations = [mutations];
    }

    for (const mutation of mutations) {
      const type = getTypeFromKlass(mutation);
      meta.mutations[type] = {
        fn: name,
        type
      };
    }
  };
}
