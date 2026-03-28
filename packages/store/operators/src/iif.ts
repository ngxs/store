import { ExistingState, NoInfer, StateOperator } from './types';

import { isStateOperator, isPredicate, Predicate } from './utils';

function retrieveValue<T>(
  operatorOrValue: StateOperator<T> | T,
  existing: ExistingState<T>
): T {
  // Delegate to the operator so a derived transformation can be applied
  // rather than substituting a static value.
  if (isStateOperator(operatorOrValue)) {
    const value = operatorOrValue(existing);
    return value as T;
  }

  // No else branch was provided, so leave the state unchanged.
  if (operatorOrValue === undefined) {
    return existing as T;
  }

  return operatorOrValue as T;
}

/**
 * Applies one of two operators (or values) based on a condition, keeping
 * conditional logic out of action handlers and inside the state mutation
 * pipeline where it belongs.
 *
 * @param condition - A boolean or a predicate receiving the current state value.
 * Use a predicate when the decision depends on the existing state rather than
 * external data available at dispatch time.
 * @param trueOperatorOrValue - Applied when `condition` is truthy.
 * @param elseOperatorOrValue - Applied when `condition` is falsy. Omit to
 * leave the state unchanged in the false branch.
 *
 * @example
 * ```ts
 * // Only add a panda when the list has fewer than 5 — the cap is enforced
 * // inside the operator so the action handler stays free of branching logic.
 * ctx.setState(
 *   patch<AnimalsStateModel>({
 *     pandas: iif(
 *       pandas => pandas.length < 5,
 *       append<string>([action.payload])
 *     )
 *   })
 * );
 * ```
 */
export function iif<T>(
  condition: NoInfer<Predicate<T>> | boolean,
  trueOperatorOrValue: NoInfer<StateOperator<T> | T>,
  elseOperatorOrValue?: NoInfer<StateOperator<T> | T>
): StateOperator<T> {
  return function iifOperator(existing: ExistingState<T>): T {
    // Normalise to a boolean so both plain booleans and predicates
    // share the same resolution path below.
    let result = !!condition;
    // Predicates receive the current state value so the decision can be
    // based on live state rather than values captured at dispatch time.
    if (isPredicate(condition)) {
      result = condition(existing as T);
    }

    if (result) {
      return retrieveValue<T>(trueOperatorOrValue as StateOperator<T> | T, existing);
    }

    return retrieveValue<T>(elseOperatorOrValue! as StateOperator<T> | T, existing);
  };
}
