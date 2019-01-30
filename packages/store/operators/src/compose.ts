import { StateOperator } from '@ngxs/store';

export function compose<T>(...operators: StateOperator<T>[]) {
  return function composeOperator(existing: Readonly<T>) {
    return operators.reduce((accumulator, operator) => operator(accumulator), existing);
  };
}
