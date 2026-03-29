import { ExistingState, StateOperator } from './types';
import { isArray } from './utils';

/**
 * Inserts an item into an array without mutating the original, satisfying
 * NGXS's immutability requirement. Handles the case where the array property
 * does not exist yet, so callers do not need to initialise it first.
 *
 * @param value - The item to insert. A `null` or `undefined` value is a no-op
 * so that callers can pass through optional data safely.
 * @param beforePosition - Index before which to insert. Omit (or pass a
 * non-positive number) to prepend to the beginning of the array.
 *
 * @example
 * ```ts
 * // Prepend a new zebra (no position = insert at index 0).
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     zebras: insertItem<string>(action.payload)
 *   })
 * );
 * ```
 *
 * @example
 * ```ts
 * // Insert before index 2, shifting subsequent items right.
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     zebras: insertItem<string>(action.payload, 2)
 *   })
 * );
 * ```
 */
export function insertItem<T>(value: NoInfer<T>, beforePosition?: number): StateOperator<T[]> {
  return function insertItemOperator(existing: ExistingState<T[]>): T[] {
    // `== null` covers both `null` and `undefined` while letting falsy
    // values like `0` or `false` through, where `!value` would not.
    if (value == null && existing) {
      return existing as T[];
    }

    // The array property may not have been initialised yet; treat it as
    // empty so callers don't have to guard against that case themselves.
    if (!isArray(existing)) {
      return [value as unknown as T];
    }

    const clone = existing.slice();

    let index = 0;

    // `> 0` rather than `>= 0` intentionally: non-numeric values coerce
    // to NaN and fail this check, so no explicit `isNumber` call is needed.
    if (beforePosition! > 0) {
      index = beforePosition!;
    }

    clone.splice(index, 0, value as unknown as T);
    return clone;
  };
}
