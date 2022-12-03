import { ExistingState, StateOperator } from '@ngxs/store';
import { isStateOperator, NoInfer } from './utils';

type NotUndefined<T> = T extends undefined ? never : T;

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NotUndefined<T[P]>> };

export function patch<T extends Record<string, any>>(
  patchObject: PatchSpec<NoInfer<T>>
): StateOperator<T> {
  return function patchStateOperator(existing: ExistingState<T>): T {
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
