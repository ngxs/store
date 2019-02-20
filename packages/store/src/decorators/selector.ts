import { createSelector } from '../utils/selector-utils';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector(selectors?: any[], skipContainerSelector: boolean = false) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    if (descriptor.value !== null) {
      const originalFn = descriptor.value;

      const memoizedFn = createSelector(
        selectors,
        originalFn.bind(target),
        skipContainerSelector
          ? undefined
          : { containerClass: target, selectorName: methodName }
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
