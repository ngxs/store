import { StateOperator } from '@ngxs/store';

import { PatchSpec, PatchValues } from './internals';
import { isStateOperator } from './utils';

export function patch<T, U extends PatchValues<T> = T>(
  patchObject: PatchSpec<T>
): StateOperator<NonNullable<U>> {
  return function patchStateOperator(existing: Readonly<U>): NonNullable<U> {
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
