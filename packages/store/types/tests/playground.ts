import { NoInfer } from '../../operators/src/types';

type CheckRO_<T> = T extends Readonly<infer O> ? (Readonly<O> extends T ? 1 : 2) : 3;
type CheckRO<T> = T extends Readonly<infer O> ? (O extends T ? 1 : 2) : 3;

type nul = CheckRO<null>;
type und = CheckRO<undefined>;
type str = CheckRO<string>;
type num = CheckRO<number>;
type bool = CheckRO<boolean>;
type big = CheckRO<bigint>;
type sym = CheckRO<symbol>;
type fun = CheckRO<() => string>;
type arr = CheckRO<readonly ['']>;
type obj = CheckRO<{ a: string }>;
type robj = CheckRO<Readonly<{ a: string }>>;
interface MyType {
  a: string;
}
type inter = CheckRO<MyType>;

// Read only can do a round trip
type test1 = { a: string } extends Readonly<{ a: string }> ? true : false;
type test2 = Readonly<{ a: string }> extends { a: string } ? true : false;

type AsReadonly<T> = T extends Readonly<infer O> ? (O extends T ? Readonly<T> : T) : T;

type _nul = AsReadonly<null>;
type _und = AsReadonly<undefined>;
type _str = AsReadonly<string>;
type _num = AsReadonly<number>;
type _bool = AsReadonly<boolean>;
type _big = AsReadonly<bigint>;
type _sym = AsReadonly<symbol>;
type _fun = AsReadonly<() => string>;
type _arr = AsReadonly<readonly ['']>;
type _arrMut = AsReadonly<['']>;
type _obj = AsReadonly<{ a: string }>;
type _robj = AsReadonly<Readonly<{ a: string }>>;
type _inter = AsReadonly<MyType>;

// EDIT asReadOnly, NoInfer
// type AsReadonly<T> = T extends Readonly<infer O> ? (O extends T ? Readonly<T> : T) : T;
type StateOperator<T> = (existing: AsReadonly<NoInfer<T>>) => T;

type IsAny<T> = 0 extends 1 & T ? true : false; // https://stackoverflow.com/a/49928360/3406963
type IsNever<T> = [T] extends [never] ? true : false;
type IsUnknown<T> = IsNever<T> extends false
  ? T extends unknown
    ? unknown extends T
      ? IsAny<T> extends false
        ? true
        : false
      : false
    : false
  : false;

/*

//type IsTupleItem<TKey extends string> = Extract<TKey, `1` | '0'>;

// type WrapArgsAsNotInferrable<T> = T;
// type WrapArgsAsNotInferrable<T extends Parameters<(...args: unknown[]) => unknown>> = {
//   [K in keyof T as Extract<K, `${number}`>]: Promise<T[K]>;
// };

//type WrapArgsAsNotInferrable<T extends Parameters<(...args: unknown[]) => unknown>> =
type WrapArgsAsNotInferrable<T extends any[]> =
  (...args: T) => any extends ((arg: any, ...rest: infer TRest) => any )
  ? [ T[0], ...WrapArgsAsNotInferrable<TRest> ]
  : [T];

type AAA<T extends any[]> = T extends [infer A, ...(infer Rest)] ? [T[0], ...AAA<Rest>] : [];

type BBB<T extends (...args: any[]) => any> =
  T extends (first: any, ...rest: infer TRest) => any
  ? (...args: [Parameters<T>[0], Parameters<BBB<(...args: TRest) => any>>]) => any
  : () => any;

  type CCC<T extends Parameters<(...args: unknown[]) => unknown>> = {
       [K in keyof T as Extract<K, `${number}`>]: T[K];
     };

     type DDD<T extends (...args: any[]) => any> =
     T extends (...args: infer TArgs) => any
     ? TArgs['length'] extends 0 ? () => ReturnType<T>
     : TArgs['length'] extends 1 ? (...args: [TArgs[0]]) => ReturnType<T>
     : TArgs['length'] extends 2 ? (...args: [TArgs[0], TArgs[1]]) => ReturnType<T>
     : never : never;

type ArgsNotInferrable<TFunc extends (...args: any[]) => any> =
  // Just using `Parameters<Fn>` isn't ideal because it doesn't handle the `this` fake parameter.
  TFunc extends (this: infer ThisArg, ...args: infer Arguments) => infer TReturn
    ? // If a function did not specify the `this` fake parameter, it will be inferred to `unknown`.
      // We want to detect this situation just to display a friendlier type upon hovering on an IntelliSense-powered IDE.
      IsUnknown<ThisArg> extends true
      ? (...args: WrapArgsAsNotInferrable<Arguments>) => TReturn
      : (this: ThisArg, ...args: WrapArgsAsNotInferrable<Arguments>) => TReturn
    : // This part should be unreachable, but we make it meaningful just in case…
      TFunc;

type MyFunc<T> = (a: T, b: T[]) => T
type X = WrapArgsAsNotInferrable<Parameters<MyFunc<string>>>;
type X1 = AAA<Parameters<MyFunc<string>>>;
type X2 = BBB<MyFunc<string>>;
type X3 = CCC<Parameters<MyFunc<string>>>;
type X4 = DDD<MyFunc<string>>;
type NonInferrableMyFunc<T> = ArgsNotInferrable<MyFunc<T>>;
type NonInferrableMy = ArgsNotInferrable<MyFunc<string>>;

const a: NonInferrableMy;

*/
