import { ExistingState, NoInfer, StateOperator } from './types';
import { isStateOperator } from './utils';

// type NotUndefined<T> = T; // extends undefined ? never : T;

//export type ɵPatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NotUndefined<T[P]>> };
export type ɵPatchSpec<T> = T extends undefined
  ? never
  : T extends Record<string, any>
  ? {
      [P in keyof T]?: T[P] | StateOperator<T[P]>;
      // [P in keyof T]?: T[P] | StateOperator<NotUndefined<T[P]>>;
      // [P in keyof T]?: T[P] extends undefined ? StateOperator<T[P]> : (T[P] | StateOperator<NotUndefined<T[P]>>);
    }
  : never;

type ɵPatchReturn<T> = T extends undefined
  ? "(The 'patch' operator does not handle 'undefined' values)"
  : StateOperator<T>;

export function patch<T extends Record<string, any>>(
  patchObject: ɵPatchSpec<NoInfer<T>>
): ɵPatchReturn<T> {
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
  } as ɵPatchReturn<T>;
}
