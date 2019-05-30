import { StateOperator } from '@ngxs/store';

import { Predicate } from './internals';
import { isPredicate, isNumber, invalidIndex } from './utils';

/**
 * After upgrading to Angular 8, TypeScript 3.4 all types were broken and tests did not pass!
 * In order to avoid breaking change, the types were set to `any`.
 * In the next pull request, we need to apply a new typing to support state operators.
 * TODO: Need to fix types
 */

/**
 * @param selector - index or predicate to remove an item from an array by
 */
export function removeItem<T = any>(selector: number | Predicate<T>): StateOperator<any> {
  return function removeItemOperator(existing: Readonly<T>): T {
    let index = -1;

    if (isPredicate(selector)) {
      index = ((existing as any) as Readonly<T[]>).findIndex(selector);
    } else if (isNumber(selector)) {
      index = selector;
    }

    if (invalidIndex(index)) {
      return existing as T;
    }

    const clone = ((existing as any) as Readonly<T[]>).slice();
    clone.splice(index, 1);
    return (clone as any) as T;
  };
}
