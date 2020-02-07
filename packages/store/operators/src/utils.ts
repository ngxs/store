import { StateOperator } from '@ngxs/store';

import { Predicate } from './internals';

export function isStateOperator<T>(value: T | StateOperator<T>): value is StateOperator<T> {
  return typeof value === 'function';
}

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

export function isPredicate<T>(value: Predicate<T> | boolean | number): value is Predicate<T> {
  return typeof value === 'function';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function invalidIndex(index: number): boolean {
  return Number.isNaN(index) || index === -1;
}

export function isNil<T>(value: T | null | undefined): value is null | undefined {
  return value === null || isUndefined(value);
}

export type RepairType<T> = T extends true ? boolean : (T extends false ? boolean : T);
