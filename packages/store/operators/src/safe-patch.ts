import { patch, type ɵPatchSpec } from './patch';
import type { ExistingState, StateOperator } from './types';

/**
 * Like `patch`, but safe to call when the state slice is `null` or
 * `undefined`. Treats a missing slice as an empty object so the patch is
 * applied against a clean baseline rather than throwing. Useful for lazily
 * initialised state properties or optional sub-states that may not have been
 * set yet.
 *
 * @example
 * ```ts
 * // Update a nested preferences slice that starts as null — no prior
 * // null-check needed; safePatch treats null as an empty object.
 * ctx.setState(
 *   patch<UserStateModel>({
 *     preferences: safePatch<UserPreferences>({ theme: action.theme })
 *   })
 * );
 * ```
 */
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
