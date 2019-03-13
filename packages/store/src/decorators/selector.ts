import { createSelector } from '../utils/selector-utils';
import { SelectorFn, SelectorType } from '../internal/internals';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector<T = any, K = any>(selectors?: SelectorType<T, K>[]) {
  return (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor => {
    if (descriptor.value !== null) {
      const originalFn = descriptor.value;

      const memoizedFn = createSelector<SelectorFn<T, K>, T, K>(
        selectors,
        originalFn.bind(target),
        { containerClass: target, selectorName: methodName }
      );

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
