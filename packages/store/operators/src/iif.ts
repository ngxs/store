import { ExistingState, NoInfer, StateOperator } from './types';

import { isStateOperator, isUndefined, isPredicate, Predicate } from './utils';

function retrieveValue<T>(
  operatorOrValue: StateOperator<T> | T,
  existing: ExistingState<T>
): T {
  // If state operator is a function
  // then call it with an original value
  if (isStateOperator(operatorOrValue)) {
    const value = operatorOrValue(existing);
    return value as T;
  }

  // If operator or value was not provided
  // e.g. `elseOperatorOrValue` is `undefined`
  // then we just return an original value
  if (isUndefined(operatorOrValue)) {
    return existing as T;
  }

  return operatorOrValue as T;
}

/**
 * @param condition - Condition can be a plain boolean value or a function,
 * that returns boolean, also this function can take a value as an argument
 * to which this state operator applies
 * @param trueOperatorOrValue - Any value or a state operator
 * @param elseOperatorOrValue - Any value or a state operator
 */
export function iif<T>(
  condition: NoInfer<Predicate<T>> | boolean,
  trueOperatorOrValue: NoInfer<StateOperator<T> | T>,
  elseOperatorOrValue?: NoInfer<StateOperator<T> | T>
): StateOperator<T> {
  return function iifOperator(existing: ExistingState<T>): T {
    // Convert the value to a boolean
    let result = !!condition;
    // but if it is a function then run it to get the result
    if (isPredicate(condition)) {
      result = condition(existing as T);
    }

    if (result) {
      return retrieveValue<T>(trueOperatorOrValue as StateOperator<T> | T, existing);
    }

    return retrieveValue<T>(elseOperatorOrValue! as StateOperator<T> | T, existing);
  };
}
