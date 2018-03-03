import { ensureStoreMetadata } from './internals';
import { StoreOptions } from './symbols';

/**
 * Decorates a class with ngxs store information.
 */
export function Store(options: StoreOptions) {
  return function(target: Function) {
    const meta = ensureStoreMetadata(target);
    meta.defaults = options.defaults;
    if (options.name) {
      meta.name = options.name;
    } else {
      meta.name = target.name.slice(0, 1).toLowerCase() + target.name.slice(1, target.name.length - 5);
    }
  };
}
