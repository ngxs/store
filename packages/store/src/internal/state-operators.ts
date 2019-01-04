import { StateOperator } from '../symbols';

export function simplePatch<T>(val: Partial<T>): StateOperator<T> {
  return (existingState: Readonly<T>) => {
    const isArray = Array.isArray(val);
    const isPrimitive = typeof val !== 'object';
    if (isArray) {
      throw new Error('Patching arrays is not supported.');
    }
    if (isPrimitive) {
      throw new Error('Patching primitives is not supported.');
    }
    const newState = { ...(<any>existingState) };
    for (const k in val) {
      newState[k] = val[k];
    }
    return <T>newState;
  };
}
