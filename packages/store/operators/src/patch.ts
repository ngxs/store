import { StateOperator } from '@ngxs/store';
import { isStateOperator } from './utils';

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NonNullable<T[P]>> };

type PatchValues<T> = {
  readonly [P in keyof T]?: T[P] extends (...args: any[]) => infer R
    ? NonNullable<R>
    : NonNullable<T[P]>
};

// internal alias types for improved checking
type Operator<T> = StateOperator<NonNullable<T[Extract<keyof T, string>]>>;
type Existing<T> = Readonly<NonNullable<T>>;
type ExistingValue<T> = Readonly<NonNullable<T[Extract<keyof T, string>]>>;
type KeyOf<T> = T[Extract<keyof T, string>] | Operator<T> | undefined;
type Patcher<T> = PatchValues<NonNullable<T>>;

export function patch<T, U extends Patcher<T> = NonNullable<T>>(
  patchObject: PatchSpec<U>
): StateOperator<NonNullable<U>> {
  return function patchStateOperator(existing: Existing<U>): NonNullable<U> {
    let clone: NonNullable<U> | null = null;

    for (const k in patchObject) {
      let newPropValue: KeyOf<U>;
      const newValue: KeyOf<U> = patchObject[k];
      const existingPropValue: KeyOf<Existing<U>> = existing[k];

      if (isStateOperator(newValue as PatchValues<T>)) {
        const operator: Operator<U> = newValue as Operator<U>;
        newPropValue = operator((existingPropValue as any) as ExistingValue<U>);
      } else {
        newPropValue = newValue;
      }

      if (newPropValue !== existingPropValue) {
        if (!clone) {
          clone = { ...(existing as object) } as NonNullable<U>;
        }

        clone[k] = newPropValue as NonNullable<U>[Extract<keyof U, string>];
      }
    }

    return clone || (existing as NonNullable<U>);
  };
}
