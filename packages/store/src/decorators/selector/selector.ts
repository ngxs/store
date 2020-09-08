import { CONFIG_MESSAGES, VALIDATION_CODE } from '../../configs/messages.config';
import { createSelector } from '../../utils/selector-utils';
import { SelectorSpec, SelectorType } from './symbols';

/**
 * Decorator for memoizing a state selector.
 */
export function Selector<T>(selectors?: T[]): SelectorType<T> {
  return <U>(
    target: any,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<SelectorSpec<T, U>>
  ): TypedPropertyDescriptor<SelectorSpec<T, U>> | void => {
    const isNotMethod = !(descriptor && descriptor.value !== null);

    if (isNotMethod) {
      throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECTOR_DECORATOR]());
    }

    const originalFn = descriptor.value;
    const memoizedFn = createSelector(selectors, originalFn as any, {
      containerClass: target,
      selectorName: key.toString(),
      getSelectorOptions() {
        return {};
      }
    });
    const newDescriptor = {
      configurable: true,
      get() {
        return memoizedFn;
      }
    };
    // Add hidden property to descriptor
    (<any>newDescriptor)['originalFn'] = originalFn;
    return newDescriptor;
  };
}
