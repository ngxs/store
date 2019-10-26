import { StateOperator } from '@ngxs/store';
import { isStateOperator } from './utils';

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NonNullable<T[P]>> };

type PatchValues<T> = {
  readonly [P in keyof T]?: T[P] extends (...args: any[]) => infer R ? R : T[P];
};

type PatchOperator<T> = <U extends PatchValues<T>>(existing: Readonly<U>) => U;

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
