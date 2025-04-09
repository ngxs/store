import { StateOperator } from './types';

export const isArray = Array.isArray;

export type Predicate<T = any> = (value: T | Readonly<T>) => boolean;

const isFunction = (value: unknown) => typeof value == 'function';

export const isStateOperator = isFunction as <T>(
  value: T | StateOperator<T>
) => value is StateOperator<T>;

export const isPredicate = isFunction as <T>(
  value: Predicate<T> | boolean | number
) => value is Predicate<T>;

export const isNumber = (value: unknown): value is number => typeof value === 'number';

export const invalidIndex = (index: number) => Number.isNaN(index) || index === -1;
