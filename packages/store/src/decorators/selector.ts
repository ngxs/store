import { createSelector } from '../utils/selector-utils';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector(selectors?: any[]) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    if (descriptor.value !== null) {
      const originalFn = descriptor.value;
      let memoizedFn: any = null;
      const newDescriptor = {
        configurable: true,
        get() {
          // Selector initialisation defered to here so that it is at runtime, not decorator parse time
          memoizedFn =
            memoizedFn ||
            createSelector(
              selectors,
              originalFn,
              {
                containerClass: target,
                selectorName: methodName,
                getSelectorOptions() {
                  return {};
                }
              }
            );
          return memoizedFn;
        }
      };
      // Add hidden property to descriptor
      (<any>newDescriptor)['originalFn'] = originalFn;
      return newDescriptor;
    } else {
      throw new Error('Selectors only work on methods');
    }
  };
}
