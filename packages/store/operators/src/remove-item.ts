import { ExistingState, NoInfer, StateOperator } from './types';
import { isPredicate, isNumber, invalidIndex, Predicate } from './utils';

/**
 * @param selector - index or predicate to remove an item from an array by
 */
export function removeItem<T>(selector: number | NoInfer<Predicate<T>>): StateOperator<T[]> {
  return function removeItemOperator(existing: ExistingState<T[]>): T[] {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as T[];
    }

    const clone = existing.slice();
    clone.splice(index, 1);
    return clone;
  };
}
