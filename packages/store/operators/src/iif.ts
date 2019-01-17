import { StateOperator } from '@ngxs/store';

import { isStateOperator, isPredicate, isUndefined } from './utils';
import { Predicate } from './internals';

function retrieveValue<T>(operatorOrValue: StateOperator<T> | T, existing?: Readonly<T>): T {
  const operatorAndExistingNotProvided = !isStateOperator(operatorOrValue) && !existing;
  if (operatorAndExistingNotProvided) {
    return operatorOrValue as T;
  }

  // If state operator is a function
  // then call it with an original value
  if (isStateOperator(operatorOrValue)) {
    return operatorOrValue(existing!);
  }

  // If operator or value was not provided
  // e.g. `elseOperatorOrValue` is `undefined`
  // then we just return an original value
  if (isUndefined(operatorOrValue)) {
    return existing!;
  }

  return operatorOrValue;
}

/**
 * @param condition - Condition can be a plain boolean value or a function,
 * that returns boolean, also this function can take a value as an argument
 * to which this state operator applies
 * @param trueOperatorOrValue - Any value or a state operator
 * @param elseOperatorOrValue - Any value or a state operator
 */
export function iif<T>(
  condition: Predicate<T> | boolean,
  trueOperatorOrValue: StateOperator<T> | T,
  elseOperatorOrValue?: StateOperator<T> | T
) {
  return function iifOperator(existing: Readonly<T>): T {
    // If condition is not `null` and not `undefined`
    let result = !!condition;
    // If condition is a function
    if (isPredicate(condition)) {
      result = condition(existing);
    }

    if (result) {
      return retrieveValue(trueOperatorOrValue, existing);
    }

    return retrieveValue(elseOperatorOrValue!, existing);
  };
}
