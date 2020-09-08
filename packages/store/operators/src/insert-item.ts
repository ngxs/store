import { StateOperator } from '@ngxs/store';
import { isNil, RepairType } from './utils';

/**
 * @param value - Value to insert
 * @param [beforePosition] -  Specified index to insert value before, optional
 */
export function insertItem<T>(
  value: T,
  beforePosition?: number
): StateOperator<RepairType<T>[]> {
  return function insertItemOperator(existing: Readonly<RepairType<T>[]>): RepairType<T>[] {
    // Have to check explicitly for `null` and `undefined`
    // because `value` can be `0`, thus `!value` will return `true`
    if (isNil(value) && existing) {
      return existing as RepairType<T>[];
    }

    // Property may be dynamic and might not existed before
    if (!Array.isArray(existing)) {
      return [value as RepairType<T>];
    }

    const clone = existing.slice();

    let index = 0;

    // No need to call `isNumber`
    // as we are checking `> 0` not `>= 0`
    // everything except number will return false here
    if (beforePosition! > 0) {
      index = beforePosition!;
    }

    clone.splice(index, 0, value as RepairType<T>);
    return clone;
  };
}
