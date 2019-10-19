import { StateOperator } from '@ngxs/store';
import { RepairType } from './utils';

export type Predicate<T = any> = (value?: RepairType<T> | Readonly<RepairType<T>>) => boolean;

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NonNullable<T[P]>> };

export type PatchValues<T> = {
  readonly [P in keyof T]?: T[P] extends (...args: any[]) => infer R ? R : T[P];
};

export type PatchOperator<T> = <U extends PatchValues<T>>(existing: Readonly<U>) => U;
