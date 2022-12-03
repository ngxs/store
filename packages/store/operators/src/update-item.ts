import { ExistingState, StateOperator } from '@ngxs/store';

import { isStateOperator, isPredicate, isNumber, invalidIndex, NoInfer } from './utils';
import { Predicate } from './internals';

/**
 * @param selector - Index of item in the array or a predicate function
 * that can be provided in `Array.prototype.findIndex`
 * @param operatorOrValue - New value under the `selector` index or a
 * function that can be applied to an existing value
 */
export function updateItem<T>(
  selector: number | NoInfer<Predicate<T>>,
  operatorOrValue: NoInfer<T> | NoInfer<StateOperator<T>>
): StateOperator<T[]> {
  return function updateItemOperator(existing: ExistingState<T[]>): T[] {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector as Predicate<T>);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as T[];
    }

    let value: T = null!;
    // Need to check if the new item value will change the existing item value
    // then, only if it will change it then clone the array and set the item
    const theOperatorOrValue = operatorOrValue as T | StateOperator<T>;
    if (isStateOperator(theOperatorOrValue)) {
      value = theOperatorOrValue(existing[index] as ExistingState<T>);
    } else {
      value = theOperatorOrValue;
    }

    // If the value hasn't been mutated
    // then we just return `existing` array
    if (value === existing[index]) {
      return existing as T[];
    }

    const clone = existing.slice();
    clone[index] = value as T;
    return clone;
  };
}
