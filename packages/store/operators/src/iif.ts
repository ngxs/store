import { StateOperator } from '@ngxs/store';

import { isStateOperator, isUndefined, isPredicate } from './utils';
import { RepairType, Predicate } from './internals';

function retrieveValue<T>(
  operatorOrValue: StateOperator<T> | T | null | undefined,
  existing?: Readonly<T>
): RepairType<T> {
  // If state operator is a function
  // then call it with an original value
  if (isStateOperator(operatorOrValue as StateOperator<T>)) {
    return (operatorOrValue as StateOperator<T>)(existing! as T) as RepairType<T>;
  }

  // If operator or value was not provided
  // e.g. `elseOperatorOrValue` is `undefined`
  // then we just return an original value
  if (isUndefined(operatorOrValue)) {
    return existing! as RepairType<T>;
  }

  return operatorOrValue as RepairType<T>;
}

/**
 * @param condition - Condition can be a plain boolean value or a function,
 * that returns boolean, also this function can take a value as an argument
 * to which this state operator applies
 * @param trueOperatorOrValue - Any value or a state operator
 * @param elseOperatorOrValue - Any value or a state operator
 * @returnType ExpandedType<true> -> boolean, ExpandedType<false> = boolean
 */
export function iif<T>(
  condition: Predicate<T> | boolean,
  trueOperatorOrValue: StateOperator<T> | T | null | undefined,
  elseOperatorOrValue?: StateOperator<T> | T | null | undefined
): StateOperator<RepairType<T>> {
  return function iifOperator(existing: Readonly<RepairType<T>>): RepairType<T> {
    // Convert the value to a boolean
    let result = !!condition;
    // but if it is a function then run it to get the result
    if (isPredicate(condition)) {
      result = condition(existing as T);
    }

    let output: RepairType<T>;

    if (result) {
      output = retrieveValue(trueOperatorOrValue, existing as T);
    } else {
      output = retrieveValue(elseOperatorOrValue!, existing as T);
    }

    return output;
  };
}
