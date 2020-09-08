import { StateOperator } from '@ngxs/store';
import { Predicate } from './internals';
import { isPredicate, isNumber, invalidIndex, RepairType } from './utils';

/**
 * @param selector - index or predicate to remove an item from an array by
 */
export function removeItem<T>(
  selector: number | Predicate<T>
): StateOperator<RepairType<T>[]> {
  return function removeItemOperator(existing: Readonly<RepairType<T>[]>): RepairType<T>[] {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as RepairType<T>[];
    }

    const clone = existing.slice();
    clone.splice(index, 1);
    return clone;
  };
}
