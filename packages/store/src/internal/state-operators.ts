import { StateOperator } from '../symbols';

export function simplePatch<T>(val: Partial<T>): StateOperator<T> {
  return (existingState: Readonly<T>) => {
    if (Array.isArray(val)) {
      throw new Error('Patching arrays is not supported.');
    }

    if (typeof val !== 'object') {
      throw new Error('Patching primitives is not supported.');
    }

    const newState: T = { ...existingState };

    for (const prop in val) {
      if (val.hasOwnProperty(prop) && isKeyPredicate(prop)) {
        newState[prop] = val[prop];
      }
    }

    return newState;
  };
}

/**
 * @description
 * To define a type guard, we simply need
 * to define a function whose return type is a type predicate:
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates
 */
function isKeyPredicate<E>(_: string | number | symbol): _ is keyof E {
  return true;
}
