/**
 * Re-exported alias for the TypeScript built-in `NoInfer<T>` (available since
 * TypeScript 5.4). Blocks the TypeScript inference engine from using this
 * parameter position to infer type parameters, so that `StateOperator<T>`
 * type parameters are resolved from context (the return type) rather than
 * from the arguments passed to the operator.
 *
 * @example
 * ```ts
 * declare function append<T>(items: NoInfer<T[]>): StateOperator<T[]>;
 * declare function appendBad<T>(items: T[]): StateOperator<T[]>;
 *
 * interface AAA {
 *   foo?: boolean;
 *   bar?: boolean;
 * }
 *
 * // Works — T is correctly inferred as AAA from the surrounding patch<...> context.
 * patch<{ test: AAA[] }>({ test: append([{ foo: true }]) });
 *
 * // Incorrectly throws: Type 'AAA' is not assignable to type '{ foo: true; }'.ts(2322)
 * // T in appendBad is incorrectly inferred as { foo: true } from the argument.
 * patch<{ test: AAA[] }>({ test: appendBad([{ foo: true }]) });
 * ```
 */
type ɵNoInfer<T> = NoInfer<T>;
export type { ɵNoInfer as NoInfer };

/* Note to maintainers... AsReadonly works as follows:
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
/**
 * IMPORTANT NOTE: This should not be used externally to the library, rather
 * the exported type `ExistingState<T>` should be used instead.
 *
 * Used to convert a type to its readonly form. This can be given any type, from
 * primitives to objects or arrays that could already be readonly or not.
 * This does not apply the readonly construct to nested objects, but only to the top level type.
 */
type ɵAsReadonly<T> = T extends Readonly<infer O> ? (O extends T ? Readonly<T> : T) : T;

/**
 * Represents the existing state that is passed into a `StateOperator` which should
 * not be modified but will be used to build the new state returned by the `StateOperator`.
 */
/* Maintainer Note:
The `ExistingState` type below is equivalent to the `ɵAsReadonly` type above.
The `T extends any ? X<T> : never` technique is used so that typescript doesn't inline this type
and show error messages referring to an internal type.
The conceptual declaration is equivalent to the following:
  `export type ExistingState<T> = ɵAsReadonly<T>;`
It is possible that in future this workaround will not work for typescript, the we will be forced
 to inline the `ɵAsReadonly<T>` type declaration into the `ExistingState<T>` type.
*/
export type ExistingState<T> = T extends any ? ɵAsReadonly<T> : never;

/**
 * This is a monotype unary function that is used to create a new state from an existing state.
 * A state operator is usually created by a function that is given some data
 * to integrate with the state and returns a state operator which integrates this data or instruction.
 *
 * In state management terminology this creator function is commonly referred to as a state operator
 * because it represents the operation to be performed. ie. `patch`, `append`, `insertItem`, `compose`, `iif`, etc.
 */
export type StateOperator<T> = (existing: ExistingState<T>) => T;
