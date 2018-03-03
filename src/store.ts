import { ensureStoreMetadata } from './internals';
import { StoreOptions, META_KEY } from './symbols';

/**
 * Gets the name of the constructor and remove suffix if applicable.
 */
const getNameFromClass = name => {
  const hasSuffix = name.slice(name.length - 5, name.length) === 'Store';
  if (hasSuffix) {
    return name.slice(0, 1).toLowerCase() + name.slice(1, name.length - 5);
  } else {
    return name.slice(0, 1).toLowerCase() + name.slice(1, name.length);
  }
};

/**
 * Decorates a class with ngxs store information.
 */
export function Store(options: StoreOptions) {
  return function(target: any) {
    const meta = ensureStoreMetadata(target);

    if (target.__proto__.hasOwnProperty(META_KEY)) {
      const parentMeta = target.__proto__[META_KEY];
      meta.mutations = {
        ...meta.mutations,
        ...parentMeta.mutations
      };

      meta.actions = {
        ...meta.actions,
        ...parentMeta.actions
      };
    }

    meta.defaults = options.defaults;
    if (options.name) {
      meta.name = options.name;
    } else {
      meta.name = getNameFromClass(target.name);
    }
  };
}
