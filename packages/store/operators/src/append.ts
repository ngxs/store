import { StateOperator } from '@ngxs/store';
import { RepairType, NoInfer } from './utils';

/**
 * @param items - Specific items to append to the end of an array
 */
export function append<T>(items: NoInfer<T>[]): StateOperator<RepairType<T>[]> {
  return function appendOperator(existing: Readonly<RepairType<T>[]>): RepairType<T>[] {
    // If `items` is `undefined` or `null` or `[]` but `existing` is provided
    // just return `existing`
    const itemsNotProvidedButExistingIs = (!items || !items.length) && existing;
    if (itemsNotProvidedButExistingIs) {
      return existing as RepairType<T>[];
    }

    if (Array.isArray(existing)) {
      return existing.concat((items as unknown) as RepairType<T>[]);
    }

    // For example if some property is added dynamically
    // and didn't exist before thus it's not `ArrayLike`
    return (items as unknown) as RepairType<T>[];
  };
}
