import { StateOperator } from '@ngxs/store';

import { isStateOperator, isPredicate, isNumber, invalidIndex } from './utils';
import { Predicate } from './internals';

/**
 * After upgrading to Angular 8, TypeScript 3.4 all types were broken and tests did not pass!
 * In order to avoid breaking change, the types were set to `any`.
 * In the next pull request, we need to apply a new typing to support state operators.
 * TODO: Need to fix types
 */

/**
 * @param selector - Index of item in the array or a predicate function
 * that can be provided in `Array.prototype.findIndex`
 * @param operatorOrValue - New value under the `selector` index or a
 * function that can be applied to an existing value
 */
export function updateItem<T = any>(
  selector: number | Predicate<T>,
  operatorOrValue: T | StateOperator<T>
): StateOperator<any> {
  return function updateItemOperator(existing: Readonly<any>): any {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as any;
    }

    let value: T = null!;
    // Need to check if the new item value will change the existing item value
    // then, only if it will change it then clone the array and set the item
    if (isStateOperator(operatorOrValue)) {
      value = operatorOrValue(existing[index]);
    } else {
      value = operatorOrValue;
    }

    // If the value hasn't been mutated
    // then we just return `existing` array
    if (value === existing[index]) {
      return existing as any;
    }

    const clone = existing.slice();
    clone[index] = value;
    return clone as any;
  };
}
