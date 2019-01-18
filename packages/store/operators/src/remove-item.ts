type Predicate<T = unknown> = (value?: T) => boolean;

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

    // If non-existing index was provided
    if (isNaN(index) || index === -1 || !existing.hasOwnProperty(index)) {
      return existing;
    }

    const clone = [...existing];
    clone.splice(index, 1);
    return clone;
  };
}

function isPredicate<T>(value: Predicate<T> | number): value is Predicate<T> {
  return typeof value === 'function';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
