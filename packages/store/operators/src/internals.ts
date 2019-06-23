import { StateOperator } from '@ngxs/store';

type PredicateValue<T, U> = T | Partial<T> | U;

export type Predicate<T, U = any> = (value?: PredicateValue<T, U>) => boolean;

export type PatchValues<T> = {
  readonly [P in keyof T]?: T[P] extends (...args: any[]) => infer R ? R : T[P];
};

export type PatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NonNullable<T[P]>> };

export type ComposeOperators<T, U = any> = StateOperator<T | Array<U> | U>;

// BUG(TS 3.4): TypeScript strangely expanding in type alias
// https://github.com/Microsoft/TypeScript/issues/30029
type Primitive = Function | string | number | boolean | undefined | null;
type IncludeType<T> = T;

// Examples:
// RepairType<true> -> boolean
// RepairType<false> -> boolean
// RepairType<'abc'> -> string
// RepairType<{}> -> object
export type RepairType<T> = T extends boolean
  ? IncludeType<boolean>
  : T extends Primitive
  ? IncludeType<T>
  : T extends object
  ? IncludeType<T>
  : never;

export type RepairTypeList<T> = Array<RepairType<T>>;
