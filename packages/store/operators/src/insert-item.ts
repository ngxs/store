import { isUndefined, isNumber } from './utils';

/**
 * @param value - Value to insert
 * @param [beforePosition] -  Specified index to insert value before, optional
 */
export function insertItem<T>(value: T, beforePosition?: number) {
  return function insertItemOperator(existing: Readonly<T[]>): T[] {
    // Have to check explicitly for `null` and `undefined`
    // because `value` can be `0`, thus `!value` will return `true`
    const isNil = isUndefined(value) || value === null;
    if (isNil && existing) {
      return existing;
    }

    // Property may be dynamic and might not existed before
    if (!Array.isArray(existing)) {
      return [value];
    }

    const clone = [...existing];

    let index = 0;

    if (isNumber(beforePosition) && beforePosition > 0) {
      index = beforePosition;
    }

    clone.splice(index, 0, value);
    return clone;
  };
}
