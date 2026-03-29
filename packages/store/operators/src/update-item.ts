import { ExistingState, NoInfer, StateOperator } from './types';

import { isStateOperator, isPredicate, isNumber, invalidIndex, Predicate } from './utils';

/**
 * Replaces or transforms a single array element without cloning elements that
 * did not change, preserving referential equality for the rest of the array.
 * Returns the original array reference when nothing changed, keeping
 * memoized selectors and `OnPush` components from re-rendering unnecessarily.
 *
 * @param selector - The index to update, or a predicate used to locate the
 * item. Prefer a predicate when the item's position may have shifted since the
 * index was last known.
 * @param operatorOrValue - The replacement value, or a state operator applied
 * to the existing element when a derived update is needed.
 *
 * @example
 * ```ts
 * // Rename a panda — locate it by current name so the index doesn't need
 * // to be known ahead of time.
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     pandas: updateItem<string>(
 *       name => name === action.payload.name,
 *       action.payload.newName
 *     )
 *   })
 * );
 * ```
 */
export function updateItem<T>(
  selector: number | NoInfer<Predicate<T>>,
  operatorOrValue: NoInfer<T> | NoInfer<StateOperator<T>>
): StateOperator<T[]> {
  return function updateItemOperator(existing: ExistingState<T[]>): T[] {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector as Predicate<T>);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as T[];
    }

    let value: T = null!;
    // Resolve the new value before touching the array so we can bail out
    // early and skip the clone when nothing actually changed.
    const theOperatorOrValue = operatorOrValue as T | StateOperator<T>;
    if (isStateOperator(theOperatorOrValue)) {
      value = theOperatorOrValue(existing[index] as ExistingState<T>);
    } else {
      value = theOperatorOrValue;
    }

    // Return the original reference to prevent memoized selectors and
    // OnPush components from reacting to a no-op update.
    if (value === existing[index]) {
      return existing as T[];
    }

    const clone = existing.slice();
    clone[index] = value as T;
    return clone;
  };
}
