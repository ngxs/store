import { ExistingState, NoInfer, StateOperator } from './types';

export function compose<T>(...operators: NoInfer<StateOperator<T>[]>): StateOperator<T> {
  return function composeOperator(existing: ExistingState<T>): T {
    return operators.reduce(
      (accumulator, operator) => operator(accumulator as ExistingState<T>),
      existing as T
    );
  };
}
