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
      const wrappedFn = function wrappedSelectorFn(...args) {
        const returnValue = prev(...args);
        if (returnValue instanceof Function) {
          const innerMemoizedFn = memoize.apply(null, [returnValue]);
          return innerMemoizedFn;
        }
        return returnValue;
      };
      const memoizedFn = memoize(wrappedFn);

      const fn = state => {
        const results = [];

        // If we are on a state class, get the metadata path
        if (metadata && metadata.path) {
          results.push(getValue(state, metadata.path));
        }

        // Allow additional selectors if passed
        if (selectors) {
          results.push(...selectors.map(a => getSelectorFn(a)(state)));
        }

        // if the lambda tries to access a something on the
        // state that doesn't exist, it will throw a TypeError.
        // since this is quite usual behaviour, we simply return undefined if so.
        try {
          return memoizedFn(...results);
        } catch (ex) {
          if (ex instanceof TypeError) {
            return undefined;
          }
          throw ex;
        }
      };

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
