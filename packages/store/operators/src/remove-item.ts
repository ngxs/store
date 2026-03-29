import { ExistingState, StateOperator } from './types';
import { isPredicate, isNumber, invalidIndex, Predicate } from './utils';

/**
 * Removes a single element from an array without mutating the original.
 * Returns the original array reference when no matching item is found, so
 * memoized selectors are not invalidated by a no-op removal.
 *
 * @param selector - The index to remove, or a predicate used to locate the
 * item. Prefer a predicate when the item's position is not guaranteed to be
 * stable across concurrent state updates.
 *
 * @example
 * ```ts
 * // Remove a panda by name — a predicate is safer than a hard-coded index
 * // because the array order may change between dispatch and execution.
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     pandas: removeItem<string>(name => name === action.payload)
 *   })
 * );
 * ```
 */
export function removeItem<T>(selector: number | NoInfer<Predicate<T>>): StateOperator<T[]> {
  return function removeItemOperator(existing: ExistingState<T[]>): T[] {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as T[];
    }

    const clone = existing.slice();
    clone.splice(index, 1);
    return clone;
  };
}
