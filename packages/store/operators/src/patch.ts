import { StateOperator } from '@ngxs/store';
import { isStateOperator, NoInfer } from './utils';

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NonNullable<T[P]>> };

type PatchValues<T> = {
  readonly [P in keyof T]?: T[P] extends (...args: any[]) => infer R ? R : T[P];
};

export function patch<T>(patchObject: NoInfer<PatchSpec<T>>): StateOperator<NonNullable<T>> {
  return (function patchStateOperator(existing: Readonly<PatchValues<T>>): NonNullable<T> {
    let clone = null;
    for (const k in patchObject) {
      const newValue = patchObject[k];
      const existingPropValue = existing[k as Extract<keyof T, string>];
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
  } as unknown) as StateOperator<NonNullable<T>>;
}
