import { ExistingState, NoInfer, StateOperator } from './types';
import { isArray } from './utils';

/**
 * Adds items to the end of an array without mutating the original. Handles
 * the case where the array property does not exist yet, so callers do not
 * need to initialise it before appending. A `null`, `undefined`, or empty
 * `items` argument is treated as a no-op to allow safe pass-through of
 * optional data.
 *
 * @param items - Items to add to the end of the array.
 *
 * @example
 * ```ts
 * // Add a new zebra to the end of the list without touching the rest of state.
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     zebras: append<string>([action.payload])
 *   })
 * );
 * ```
 */
export function append<T>(items: NoInfer<T[]>): StateOperator<T[]> {
  return function appendOperator(existing: ExistingState<T[]>): T[] {
    // A nullish `items` is a pure pass-through no-op, so the existing slice
    // is returned untouched even when it hasn't been initialised yet
    // (previously `append(null)` on a missing slice returned `null` and
    // materialised the property).
    if (items == null) {
      return existing as unknown as T[];
    }

    // An empty `items` array is a no-op when there is already an array to
    // leave untouched. When the slice doesn't exist yet it falls through
    // below and initialises the property to `[]`.
    if (!items.length && existing) {
      return existing as unknown as T[];
    }

    if (isArray(existing)) {
      return existing.concat(items as unknown as ExistingState<T[]>);
    }

    // The array property was never initialised, so `items` becomes the
    // initial state rather than being appended to a non-existent array.
    return items as unknown as T[];
  };
}
