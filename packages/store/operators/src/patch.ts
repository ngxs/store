import { isStateOperator } from './utils';
import { PatchOperator, PatchSpec, PatchValues } from './internals';

export function patch<T>(patchObject: PatchSpec<T>): PatchOperator<T> {
  return function patchStateOperator<U extends PatchValues<T>>(existing: Readonly<U>): U {
    let clone = null;
    for (const k in patchObject) {
      const newValue = patchObject[k];
      const existingPropValue = existing[k];
      const newPropValue = isStateOperator(newValue)
        ? newValue(<any>existingPropValue)
        : newValue;
      if (newPropValue !== existingPropValue) {
        if (!clone) {
          clone = { ...(<any>existing) };
        }
        clone[k] = newPropValue;
      }
    }
    return clone || existing;
  };
}
