import { ExistingState, NoInfer, StateOperator } from './types';
import { isStateOperator } from './utils';

type NotUndefined<T> = T extends undefined ? never : T;

export type ɵPatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NotUndefined<T[P]>> };

/**
 * Applies a partial update to a state object, only cloning it when at least
 * one property actually changes. This preserves referential equality for
 * unchanged states, preventing unnecessary re-renders in `OnPush` components
 * and keeping memoized selectors from recalculating.
 *
 * Each property in `patchObject` can itself be a state operator, enabling
 * nested immutable updates without manually spreading every level of the tree.
 *
 * @example
 * ```ts
 * // Add an optional property to a state slice without touching existing ones.
 * ctx.setState(
 *   patch<AnimalsStateModel>({ monkeys: [] })
 * );
 * ```
 *
 * @example
 * ```ts
 * // Deep update — specify explicit types at each level so TypeScript can
 * // catch property name mistakes in nested patches.
 * ctx.setState(
 *   patch<AddressStateModel>({
 *     country: patch<AddressStateModel['country']>({
 *       city: patch<AddressStateModel['country']['city']>({
 *         address: patch<AddressStateModel['country']['city']['address']>({
 *           line1: action.line1
 *         })
 *       })
 *     })
 *   })
 * );
 * ```
 */
export function patch<T extends Record<string, any>>(
  patchObject: NoInfer<ɵPatchSpec<T>>
): StateOperator<T> {
  return function patchStateOperator(existing: ExistingState<T>): T {
    let clone = null;
    for (const k in patchObject) {
      const newValue = patchObject[k];
      const existingPropValue = existing?.[k];
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
