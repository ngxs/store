import { StateOperator } from '../symbols';
import { isArray, isKeyPredicate, isPrimitive, shallowClone } from './internals';

export function simplePatch<T>(val: Partial<T>): StateOperator<T> {
  return (existingState: Readonly<T>) => {
    if (isArray(val)) {
      throw new Error('Patching arrays is not supported.');
    }

    if (isPrimitive(val)) {
      throw new Error('Patching primitives is not supported.');
    }

    const newState: T = shallowClone(existingState);

    for (const prop in val) {
      if (val.hasOwnProperty(prop) && isKeyPredicate(prop)) {
        newState[prop] = val[prop];
      }
    }

    return newState;
  };
}
