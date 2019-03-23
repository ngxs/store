import { Predicate } from './internals';
import { isPredicate, isNumber, invalidIndex } from './utils';

/**
 * @param selector - index or predicate to remove an item from an array by
 */
export function removeItem<T>(selector: number | Predicate<T>) {
  return function removeItemOperator(existing: Readonly<T[]>): T[] {
    let index = -1;

    if (isPredicate(selector)) {
      index = existing.findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing;
    }

    const clone = [...existing];
    clone.splice(index, 1);
    return clone;
  };
}
