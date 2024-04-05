import { ɵSelectorDef, ɵSelectorReturnType } from '../../selectors';

/**
 * Defines a tuple of selector functions, state tokens, and state classes that a selector decorated
 * by `@Selector()` can depend on.
 */
export type SelectorDefTuple = ɵSelectorDef<any>[] | [ɵSelectorDef<any>];

type UnknownToAny<T> = unknown extends T ? any : T;
type EnsureArray<T> = T extends any[] ? T : never;

/**
 * Given a tuple of selector functions, state tokens, state classes, etc., returns a tuple of what
 * a dependent selector would expect to receive for that parent as an argument when called.
 *
 * For example, if the first element in the tuple `T` is a selector function that returns a
 * `number`, then the first element of the result tuple will be `number`. If the second element
 * in the tuple `T` is a state class with model `{ name: string }`, then the second element of
 * the result tuple will be `{ name: string }`.
 */
type SelectorReturnTypeList<T extends SelectorDefTuple> = EnsureArray<{
  [K in keyof T]: T[K] extends ɵSelectorDef<any>
    ? UnknownToAny<ɵSelectorReturnType<T[K]>>
    : never;
}>;

/**
 * Defines a selector function matching a given argument list of parent selectors/states/tokens
 * and a given return type.
 */
export type SelectorSpec<T, U> = T extends []
  ? () => any
  : T extends SelectorDefTuple
    ? (...states: SelectorReturnTypeList<T>) => U
    : () => any;

/**
 * Defines a selector function matching `SelectorSpec<T, U>` but with the assumption that the
 * container state has been injected as the first argument.
 */
type SelectorSpecWithInjectedState<T, U> = SelectorSpec<
  T extends SelectorDefTuple ? [any, ...T] : [any],
  T extends SelectorDefTuple ? U : any
>;

/**
 * Defines a property descriptor for the `@Selector` decorator that decorates a function with
 * parent selectors/states/tokens `T` and return type `U`.
 */
type DescriptorWithNoInjectedState<T, U> = TypedPropertyDescriptor<SelectorSpec<T, U>>;

/**
 * Same as `DescriptorWithNoInjectedState` but with state injected as the first argument.
 */
type DescriptorWithInjectedState<T, U> = TypedPropertyDescriptor<
  SelectorSpecWithInjectedState<T, U>
>;

type DecoratorArgs<T> = [target: any, key: string | symbol, descriptor?: T];

/**
 * Defines the return type of a call to `@Selector` when there is no argument given
 * (e.g. `@Selector()` counts, but `@Selector([])` does not)
 *
 * This result is a decorator that can only be used to decorate a function with no arguments or a
 * single argument that is the container state.
 */
type SelectorTypeNoDecoratorArgs = {
  <U>(
    ...args: DecoratorArgs<DescriptorWithNoInjectedState<unknown, U>>
  ): void | DescriptorWithNoInjectedState<unknown, U>;
  <U>(
    ...args: DecoratorArgs<DescriptorWithInjectedState<unknown, U>>
  ): void | DescriptorWithInjectedState<unknown, U>;
};

/**
 * Defines the return type of a call to `@Selector` when there is an argument given.
 * (e.g. `@Selector([])` counts, but `@Selector()` does not)
 *
 * This result is a decorator that can only be used to decorate a function with an argument list
 * matching the results of the tuple of parents `T`.
 */
type SelectorTypeWithDecoratorArgs<T> = {
  <U>(
    ...args: DecoratorArgs<DescriptorWithNoInjectedState<T, U>>
  ): void | DescriptorWithNoInjectedState<T, U>;
  /**
   * @deprecated
   * Read the deprecation notice at this link: https://ngxs.io/deprecations/inject-container-state-deprecation.md.
   */
  <U>(
    ...args: DecoratorArgs<DescriptorWithInjectedState<T, U>>
  ): void | DescriptorWithInjectedState<T, U>;
};

/**
 * Defines the return type of a call to `@Selector`. This result is a decorator that can only be
 * used to decorate a function with an argument list matching the results of the tuple of
 * parents `T`.
 */
export type SelectorType<T> = unknown extends T
  ? SelectorTypeNoDecoratorArgs
  : SelectorTypeWithDecoratorArgs<T>;
