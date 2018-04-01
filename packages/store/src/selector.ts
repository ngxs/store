import { memoize } from './memoize';
import { getValue } from './utils';
import { ensureStoreMetadata } from './internals';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector(...args) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const metadata = ensureStoreMetadata(target);

    if (descriptor.value !== null) {
      const prev = descriptor.value;

      const fn = state => {
        const local = getValue(state, metadata.path);
        // if the lambda tries to access a something on the state that doesn't exist, it will throw a TypeError.
        // since this is quite usual behaviour, we simply return undefined if so.
        try {
          return prev(local);
        } catch (ex) {
          if (ex instanceof TypeError) {
            return undefined;
          }
          throw ex;
        }
      };

      return {
        configurable: true,
        get() {
          return memoize.apply(null, [fn, ...args]);
        }
      };
    } else {
      throw new Error('Selectors only work on methods');
    }
  };
}
