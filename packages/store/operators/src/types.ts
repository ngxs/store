type _NoInfer<T> = T extends infer S ? S : never;
export type NoInfer<T> = T extends (infer O)[] ? _NoInfer<O>[] : _NoInfer<T>;

/* AsReadonly works as follows:
 It is best explained by its 3 result types.
 For illustration:
  type Result<T> = T extends Readonly<infer O> ? (O extends T ? 1 : 2) : 3;
  // 1: Can be converted to readonly
  type Returns1 = Result<any[] | readonly any[] | Readonly<{ a: string }> | { a: string } | Readonly<MyType> | MyType>;
  // 2: Readonly doesn't apply
  type Returns2 = Result<string | number | boolean | bigint | symbol | ((...arg: any[]) => any)>;
  // 3: Readonly doesn't make sense
  type Returns3 = Result<unknown | undefined | null>;
 Therefore it is just result type 3 that is wrapped with the Readonly<...> type in the AsReadonly type.
 */
export type AsReadonly<T> = T extends Readonly<infer O> ? (O extends T ? Readonly<T> : T) : T;

export type ExistingState<T> = AsReadonly<T>;

export type StateOperator<T> = (existing: ExistingState<T>) => T;
