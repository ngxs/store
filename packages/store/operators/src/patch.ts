import { PatchSpec, PatchValues } from './internals';
import { isStateOperator } from './utils';

export function patch<T>(patchObject: PatchSpec<T>) {
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
