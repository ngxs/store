import { patch, type ɵPatchSpec } from './patch';
import type { ExistingState, NoInfer, StateOperator } from './types';

export function safePatch<T extends object>(
  patchSpec: NoInfer<ɵPatchSpec<T>>
): StateOperator<T> {
  const patcher = patch(patchSpec as ɵPatchSpec<T>) as unknown as StateOperator<
    Readonly<NonNullable<T>>
  >;
  return function patchSafely(existing: ExistingState<T>): T {
    return patcher(existing ?? ({} as ExistingState<Readonly<NonNullable<T>>>));
  };
}
