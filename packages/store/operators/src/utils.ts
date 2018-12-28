import { StateOperator } from '@ngxs/store';

export function isStateOperator<T>(value: T | StateOperator<T>): value is StateOperator<T> {
  return typeof value === 'function';
}
