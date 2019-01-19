/**
 * @param items - Specific items to append to the end of an array
 */
export function append<T>(items: T[]) {
  return function appendOperator(existing: Readonly<T[]>): T[] {
    // If `items` is `undefined` or `null` or `[]` but `existing` is provided
    // just return `existing`
    const itemsNotProvidedButExistingIs = (!items || !items.length) && existing;
    if (itemsNotProvidedButExistingIs) {
      return existing;
    }

    if (Array.isArray(existing)) {
      return existing.concat(items);
    }

    // For example if some property is added dynamically
    // and didn't exist before thus it's not `ArrayLike`
    return items;
  };
}
