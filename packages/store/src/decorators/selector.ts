import { CONFIG_MESSAGES, VALIDATION_CODE } from '../configs/messages.config';
import { createSelector } from '../utils/selector-utils';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector(selectors?: any[]): MethodDecorator {
  return <T>(
    target: any,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> | void => {
    const isNotMethod = !(descriptor && descriptor.value !== null);

    if (isNotMethod) {
      throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECTOR_DECORATOR]());
    }

    const originalFn = descriptor.value;
    let memoizedFn: any = null;
    const newDescriptor = {
      configurable: true,
      get() {
        // Selector initialisation deferred to here so that it is at runtime, not decorator parse time
        memoizedFn =
          memoizedFn ||
          createSelector(
            selectors,
            originalFn as any,
            {
              containerClass: target,
              selectorName: key.toString(),
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
  };
}
