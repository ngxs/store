import { StateOperator } from '@ngxs/store';

/**
 * After upgrading to Angular 8, TypeScript 3.4 all types were broken and tests did not pass!
 * In order to avoid breaking change, the types were set to `any`.
 * In the next pull request, we need to apply a new typing to support state operators.
 * TODO: Need to fix types
 */

/**
 * @param items - Specific items to append to the end of an array
 */
export function append<T>(items: T[]): StateOperator<any> {
  return function appendOperator(existing: Readonly<any>): any {
    // If `items` is `undefined` or `null` or `[]` but `existing` is provided
    // just return `existing`
    const itemsNotProvidedButExistingIs = (!items || !items.length) && existing;
    if (itemsNotProvidedButExistingIs) {
      return existing as T[];
    }

    if (Array.isArray(existing)) {
      return existing.concat(items);
    }

    // For example if some property is added dynamically
    // and didn't exist before thus it's not `ArrayLike`
    return items;
  };
}
