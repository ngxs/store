import { throwSelectorDecoratorError } from '../../configs/messages.config';
import { createSelector } from '../../selectors/create-selector';
import { SelectorDefTuple, SelectorType } from './symbols';

/**
 * Decorator for creating a state selector for the current state.
 */
export function Selector(): SelectorType<unknown>;

/**
 * Decorator for creating a state selector from the provided selectors (and optionally the container State, depending on the applicable Selector Options).
 */
export function Selector<T extends SelectorDefTuple>(selectors: T): SelectorType<T>;

export function Selector<T extends SelectorDefTuple = []>(
  selectors?: T
): SelectorType<unknown> | SelectorType<T> {
  return <U>(
    target: any,
    key: string | symbol,
    descriptor?: TypedPropertyDescriptor<(...states: any[]) => U>
  ): TypedPropertyDescriptor<(...states: any[]) => U> | void => {
    descriptor ||= Object.getOwnPropertyDescriptor(target, key)!;

    const originalFn = descriptor?.value;

    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      if (typeof originalFn !== 'function') {
        throwSelectorDecoratorError();
      }
    }

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
      },
      originalFn
    };
    return newDescriptor;
  };
}
