import { StateOperator } from '@ngxs/store';

import { isStateOperator, isUndefined, isPredicate, RepairType } from './utils';
import { Predicate } from './internals';

function retrieveValue<T>(
  operatorOrValue: StateOperator<T> | T,
  existing?: Readonly<RepairType<T>>
): RepairType<T> {
  // If state operator is a function
  // then call it with an original value
  if (isStateOperator(operatorOrValue)) {
    const value = operatorOrValue(existing! as Readonly<T>);
    return value as RepairType<T>;
  }

  // If operator or value was not provided
  // e.g. `elseOperatorOrValue` is `undefined`
  // then we just return an original value
  if (isUndefined(operatorOrValue)) {
    return (<any>existing)! as RepairType<T>;
  }

  return operatorOrValue as RepairType<T>;
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
): StateOperator<RepairType<T>> {
  return function iifOperator(existing: Readonly<RepairType<T>>): RepairType<T> {
    // Convert the value to a boolean
    let result = !!condition;
    // but if it is a function then run it to get the result
    if (isPredicate(condition)) {
      result = condition(existing);
    }

    if (result) {
      return retrieveValue<T>(trueOperatorOrValue, existing as RepairType<T>);
    }

    return retrieveValue<T>(elseOperatorOrValue!, existing as RepairType<T>);
  };
}
