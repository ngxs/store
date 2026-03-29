import { type ExistingState, type NoInfer } from './types';
import type { Predicate } from './utils';

/**
 * Removes every array element that matches the predicate. Unlike `removeItem`,
 * which stops at the first match, this operator walks the entire array so all
 * qualifying elements are eliminated in one pass.
 *
 * Returns the original array reference when no elements matched, so memoized
 * selectors are not invalidated by a no-op removal.
 *
 * @param selector - Predicate used to decide which elements to remove.
 * Elements for which the predicate returns `true` are dropped; the rest are kept.
 *
 * @example
 * ```ts
 * // Remove all inactive animals in one setState call.
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     animals: removeItems<Animal>(animal => !animal.active)
 *   })
 * );
 * ```
 */
export function removeItems<T>(selector: NoInfer<Predicate<T>>) {
  return function removeItemsOperator(existing: ExistingState<T[]>): T[] {
    if (!Array.isArray(existing)) {
      return [] as T[];
    } else if (existing.length === 0) {
      return existing as T[];
    }

    const newValues: T[] = [];
    for (let index = 0; index < existing.length; index++) {
      const value = existing[index];
      // Keep elements that do NOT match — the predicate describes what to remove.
      if (selector(value) === false) {
        newValues.push(value);
      }
    }

    // Return the original reference when nothing was removed to avoid
    // invalidating memoized selectors on a no-op call.
    // Note: checking length equality (not `newValues.length > 0`) is
    // intentional — the latter would incorrectly return `existing` when
    // all elements were removed and `newValues` is empty.
    return newValues.length === existing.length ? (existing as T[]) : newValues;
  };
}
