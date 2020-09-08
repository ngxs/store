import { StateOperator } from '@ngxs/store';

import { isStateOperator, isPredicate, isNumber, invalidIndex, RepairType } from './utils';
import { Predicate } from './internals';

/**
 * @param selector - Index of item in the array or a predicate function
 * that can be provided in `Array.prototype.findIndex`
 * @param operatorOrValue - New value under the `selector` index or a
 * function that can be applied to an existing value
 */
export function updateItem<T>(
  selector: number | Predicate<T>,
  operatorOrValue: T | StateOperator<T>
): StateOperator<RepairType<T>[]> {
  return function updateItemOperator(existing: Readonly<RepairType<T>[]>): RepairType<T>[] {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as RepairType<T>[];
    }

    let value: T = null!;
    // Need to check if the new item value will change the existing item value
    // then, only if it will change it then clone the array and set the item
    if (isStateOperator(operatorOrValue)) {
      value = operatorOrValue(existing[index] as Readonly<T>);
    } else {
      value = operatorOrValue;
    }

    // If the value hasn't been mutated
    // then we just return `existing` array
    if (value === existing[index]) {
      return existing as RepairType<T>[];
    }

    const clone = existing.slice();
    clone[index] = value as RepairType<T>;
    return clone;
  };
}
