import { StateOperator } from '@ngxs/store';
import { isStateOperator } from './utils';

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NonNullable<T[P]>> };

export function patch<T, U extends T = T>(patchObject: PatchSpec<T>): StateOperator<U> {
  return function patchStateOperator(existing: Readonly<U>): U {
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
