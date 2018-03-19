import { ensureStoreMetadata } from './internals';
import { StoreOptions, META_KEY } from './symbols';

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  return function(target: any) {
    const meta = ensureStoreMetadata(target);

    // Handle inheritance
    if (target.__proto__.hasOwnProperty(META_KEY)) {
      const parentMeta = target.__proto__[META_KEY];

      meta.actions = {
        ...meta.actions,
        ...parentMeta.actions
      };
    }

    meta.children = options.children;
    meta.defaults = options.defaults;
    meta.name = options.name;
  };
}
