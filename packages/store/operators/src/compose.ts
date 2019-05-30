import { StateOperator } from '@ngxs/store';

/**
 * After upgrading to Angular 8, TypeScript 3.4 all types were broken and tests did not pass!
 * In order to avoid breaking change, the types were set to `any`.
 * In the next pull request, we need to apply a new typing to support state operators.
 * TODO: Need to fix types
 */

export function compose<T>(
  ...operators: Array<StateOperator<T> | StateOperator<T[]>>
): StateOperator<any | any[]> {
  return function composeOperator(existing: Readonly<T>) {
    return operators.reduce((accumulator: any, operator) => operator(accumulator), existing);
  };
}
