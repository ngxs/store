import { isNil } from './utils';

/**
 * After upgrading to Angular 8, TypeScript 3.4 all types were broken and tests did not pass!
 * In order to avoid breaking change, the types were set to `any`.
 * In the next pull request, we need to apply a new typing to support state operators.
 * TODO: Need to fix types
 */

/**
 * @param value - Value to insert
 * @param [beforePosition] -  Specified index to insert value before, optional
 */
export function insertItem<T>(value: T, beforePosition?: number) {
  return function insertItemOperator(existing: Readonly<T[]>): T[] {
    // Have to check explicitly for `null` and `undefined`
    // because `value` can be `0`, thus `!value` will return `true`
    if (isNil(value) && existing) {
      return existing as T[];
    }

    // Property may be dynamic and might not existed before
    if (!Array.isArray(existing)) {
      return [value];
    }

    const clone = existing.slice();

    let index = 0;

    // No need to call `isNumber`
    // as we are checking `> 0` not `>= 0`
    // everything except number will return false here
    if (beforePosition! > 0) {
      index = beforePosition!;
    }

    clone.splice(index, 0, value);
    return clone;
  };
}
