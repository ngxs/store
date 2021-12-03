import { StateOperator } from '@ngxs/store';
import { NoInfer } from './utils';

export function compose<T>(...operators: NoInfer<StateOperator<T>[]>): StateOperator<T> {
  return function composeOperator(existing: Readonly<T>): T {
    return operators.reduce((accumulator, operator) => operator(accumulator), existing);
  };
}
