import { ensureStoreMetadata } from './internals';

export function Container(options) {
    return function(target: Function) {
      const meta = ensureStoreMetadata(target);
      meta.initialState = options.state;
      meta.namespace = options.namespace || target.name;
    };
  }
