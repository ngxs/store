import { StateOperator } from '@ngxs/store';

import { Predicate } from './internals';

export function isStateOperator<T>(value: T | StateOperator<T>): value is StateOperator<T> {
  return typeof value === 'function';
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isPredicate<T>(value: Predicate<T> | boolean | number): value is Predicate<T> {
  return typeof value === 'function';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
