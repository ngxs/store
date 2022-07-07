import { StateOperator } from '@ngxs/store';

import { isStateOperator, isUndefined, isPredicate, NoInfer, RepairType } from './utils';
import { Predicate } from './internals';

type OperatorOrValue<T> = StateOperator<T> | T;

function retrieveValue<T>(
  operatorOrValue: OperatorOrValue<NoInfer<T>>,
  existing: Readonly<RepairType<T>>
): RepairType<T> {
  // If operator or value was not provided
  // e.g. `elseOperatorOrValue` is `undefined`
  // then we just return an original value
  if (isUndefined(operatorOrValue)) {
    return (<any>existing)! as RepairType<T>;
  }

  // If state operator is a function
  // then call it with an original value
  const theOperatorOrValue = operatorOrValue;
  if (isStateOperator(theOperatorOrValue)) {
    const value = theOperatorOrValue((existing as unknown) as Readonly<NoInfer<T>>);
    return (value as unknown) as RepairType<T>;
  }

  return (operatorOrValue as unknown) as RepairType<T>;
}

/**
 * @param condition - Condition can be a plain boolean value or a function,
 * that returns boolean, also this function can take a value as an argument
 * to which this state operator applies
 * @param trueOperatorOrValue - Any value or a state operator
 * @param elseOperatorOrValue - Any value or a state operator
 */
export function iif<T>(
  condition: Predicate<NoInfer<T>> | boolean,
  trueOperatorOrValue: OperatorOrValue<NoInfer<T>>,
  elseOperatorOrValue?: OperatorOrValue<NoInfer<T>>
): StateOperator<RepairType<T>> {
  return function iifOperator(existing: Readonly<RepairType<T>>): RepairType<T> {
    // Convert the value to a boolean
    let result = !!condition;
    // but if it is a function then run it to get the result
    if (isPredicate<T>(condition)) {
      result = condition((existing as unknown) as T);
    }

    if (result) {
      return retrieveValue<T>(trueOperatorOrValue, existing);
    }

    return retrieveValue<T>(elseOperatorOrValue!, existing);
  };
}
