import { ensureStoreMetadata } from './internals';

export function Store(options) {
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
