import { memoize } from './memoize';
import { getValue } from './utils';
import { ensureStoreMetadata, ensureSelectorMetadata } from './internals';
import { getSelectorFn } from './selector-utils';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector(selectors?: any[]) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const metadata = ensureStoreMetadata(target);

    if (descriptor.value !== null) {
      const prev = descriptor.value;

      const fn = state => {
        const results = [getValue(state, metadata.path)];

        if (selectors) {
          results.push(...selectors.map(a => getSelectorFn(a)(state)));
          // TODO
        }

        // if the lambda tries to access a something on the
        // state that doesn't exist, it will throw a TypeError.
        // since this is quite usual behaviour, we simply return undefined if so.
        try {
          return prev(...results);
        } catch (ex) {
          if (ex instanceof TypeError) {
            return undefined;
          }
          throw ex;
        }
      };

      const memoizedFn = memoize.apply(null, [prev]);

      const selectorMetaData = ensureSelectorMetadata(memoizedFn);
      selectorMetaData.originalFn = prev;
      selectorMetaData.storeMetaData = metadata;
      selectorMetaData.selectFromAppState = fn;

      return {
        configurable: true,
        get() {
          return memoizedFn;
        }
      };
    } else {
      throw new Error('Selectors only work on methods');
    }
  };
}
