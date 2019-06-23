import { StateOperator } from '@ngxs/store';
import { ComposeOperators } from './internals';

export function compose<T>(...operators: ComposeOperators<T>[]): StateOperator<T> {
  return function composeOperator(existing: Readonly<T>): T {
    return operators.reduce((accumulator, operator) => operator(accumulator), existing);
  };
}
