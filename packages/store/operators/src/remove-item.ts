import { StateOperator } from '@ngxs/store';

import { Predicate, RepairTypeList } from './internals';
import { isPredicate, isNumber, invalidIndex } from './utils';

/**
 * @param selector - index or predicate to remove an item from an array by
 */
export function removeItem<T>(
  selector: number | Predicate<T>
): StateOperator<RepairTypeList<T>> {
  return function removeItemOperator(
    existing: Readonly<RepairTypeList<T>>
  ): RepairTypeList<T> {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as RepairTypeList<T>;
    }

    const clone = existing.slice();
    clone.splice(index, 1);
    return clone;
  };
}
