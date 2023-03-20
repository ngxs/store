import { throwSelectorDecoratorError } from '../../configs/messages.config';
import { createSelector } from '../../selectors/selector-utils';
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
    descriptor ||= Object.getOwnPropertyDescriptor(target, key)!;

    const originalFn = descriptor?.value;

    // Caretaker note: we have still left the `typeof` condition in order to avoid
    // creating a breaking change for projects that still use the View Engine.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (originalFn && typeof originalFn !== 'function') {
        throwSelectorDecoratorError();
      }
    }

    const memoizedFn = createSelector(selectors, originalFn as any, {
      containerClass: target,
      selectorName: key.toString(),
      getSelectorOptions() {
        return {};
      },
    });
    const newDescriptor = {
      configurable: true,
      get() {
        return memoizedFn;
      },
    };
    // Add hidden property to descriptor
    (<any>newDescriptor)['originalFn'] = originalFn;
    return newDescriptor;
  };
}
