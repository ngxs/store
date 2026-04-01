import { type StateOperator, type ExistingState, type NoInfer } from './types';
import { isStateOperator, type Predicate } from './utils';

/**
 * Replaces or transforms every array element that matches the predicate.
 * Unlike `updateItem`, which stops at the first match, this operator walks
 * the entire array so all qualifying elements are updated in one pass.
 *
 * Returns the original array reference unchanged when no elements match the
 * predicate, preserving referential equality for memoized selectors. A new
 * array is returned only when at least one element was actually updated.
 *
 * @param selector - Predicate used to decide which elements to update.
 * @param operatorOrValue - Replacement value, or a state operator applied
 * to each matching element when a derived update is needed.
 *
 * @example
 * ```ts
 * // Mark every inactive animal as active in one setState call.
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     animals: updateItems<Animal>(
 *       animal => !animal.active,
 *       patch({ active: true })
 *     )
 *   })
 * );
 * ```
 */
export function updateItems<T>(
  selector: NoInfer<Predicate<T>>,
  operatorOrValue: NoInfer<T> | NoInfer<StateOperator<T>>
) {
  return function updateItemsOperator(existing: ExistingState<T[]>): T[] {
    if (!Array.isArray(existing)) {
      return [] as T[];
    } else if (existing.length === 0) {
      return existing as T[];
    }

    const clone = existing.slice();
    let updated = false;
    for (let index = 0; index < clone.length; index++) {
      let value = clone[index];
      if (selector(value)) {
        const theOperatorOrValue = operatorOrValue as T | StateOperator<T>;
        if (isStateOperator(theOperatorOrValue)) {
          value = theOperatorOrValue(value as ExistingState<T>);
        } else {
          value = theOperatorOrValue;
        }
        clone[index] = value;
        updated = true;
      }
    }
    // Return the original reference when nothing was updated to avoid
    // invalidating memoized selectors on a no-op call.
    return updated ? clone : existing;
  };
}
