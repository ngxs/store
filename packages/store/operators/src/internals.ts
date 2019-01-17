import { StateOperator } from '@ngxs/store';

export type Predicate<T = unknown> = (value?: T) => boolean;

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NonNullable<T[P]>> };

export type PatchValues<T> = {
  readonly [P in keyof T]?: T[P] extends (...args: any[]) => infer R ? R : T[P]
};
