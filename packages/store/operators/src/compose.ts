import { ExistingState, NoInfer, StateOperator } from './types';

/**
 * Chains multiple state operators so they execute left-to-right, each
 * receiving the output of the previous one. Useful when several independent
 * transformations must be applied to the same state slice in a single atomic
 * update, avoiding multiple `setState` calls.
 *
 * @example
 * ```ts
 * // Apply two independent array mutations in one atomic setState call.
 * ctx.setState(
 *   compose<AnimalsStateModel>(
 *     patch({ zebras: append<string>([action.zebraName]) }),
 *     patch({ pandas: removeItem<string>(name => name === action.pandaToRemove) })
 *   )
 * );
 * ```
 */
export function compose<T>(...operators: NoInfer<StateOperator<T>[]>): StateOperator<T> {
  return function composeOperator(existing: ExistingState<T>): T {
    return operators.reduce(
      (accumulator, operator) => operator(accumulator as ExistingState<T>),
      existing as T
    );
  };
}
