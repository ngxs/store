import { memoize } from './memoize';
import { META_KEY } from './symbols';
import { getValue } from './internals';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector(...args) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const metadata = target[META_KEY];
    if (descriptor.value !== null) {
      const prev = descriptor.value;

      const fn = state => {
        const local = getValue(state, metadata.path);
        return prev(local);
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
