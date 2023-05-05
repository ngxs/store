type _NoInfer<T> = T extends infer S ? S : never;
/**
 * Blocks the ability of the typescript inferrence engine to be able to use the provided type as part of
 * inferring any type parameters from this usage.
 * @example
 * Primarily used to wrap parameters of functions in order to prevent the TypeScript inferrence engine
 * from inferring a type parameter of the function from the value provided to this parameter.
 * This essentially blocks the Contravariance of the function (through its parameters) so that the
 * function type parameter is purely determined by the Covariant requirements of the function's return type.
 * This is key to creating `StateOperator`s that are typed based on their contextual usage and not on the arguments
 * provided to them. This is critical for type safety and intellisense for State Operators.
 * Here is an example of how this benefits a state operator:
 * ```ts
 * declare function append<T>(items: NoInfer<T[]>): StateOperator<T[]>;
 * declare function appendBad<T>(items: T[]): StateOperator<T[]>;
 *
 * interface AAA {
 *   foo?: boolean;
 *   bar?: boolean;
 * }
 *
 * // Works
 * // (T in append is correctly inferred as AAA)
 * patch<{ test: AAA[] }>({ test: append([{ foo: true }]) });
 *
 * // Incorrectly throws: Type 'AAA' is not assignable to type '{ foo: true; }'.ts(2322)
 * // (T in appendBad is incorrectly inferred as { foo: true; })
 * patch<{ test: AAA[] }>({ test: appendBad([{ foo: true }]) });
 * ```
 *
 */
export type NoInfer<T> = T extends (infer O)[] ? _NoInfer<O>[] : _NoInfer<T>;
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
