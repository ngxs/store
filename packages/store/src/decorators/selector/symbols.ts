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
 * For example, if the first element in `ParentsTuple` is a selector function that returns a
 * `number`, then the first element of the result tuple will be `number`. If the second element
 * in `ParentsTuple` is a state class with model `{ name: string }`, then the second element of
 * the result tuple will be `{ name: string }`.
 */
type SelectorReturnTypeList<ParentsTuple extends SelectorDefTuple> = EnsureArray<{
  [ParentsTupleIndex in keyof ParentsTuple]: ParentsTuple[ParentsTupleIndex] extends ɵSelectorDef<any>
    ? UnknownToAny<ɵSelectorReturnType<ParentsTuple[ParentsTupleIndex]>>
    : never;
}>;

/**
 * Defines a selector function matching a given argument list of parent selectors/states/tokens
 * and a given return type.
 */
export type SelectorSpec<ParentsTuple, Return> = ParentsTuple extends []
  ? () => any
  : ParentsTuple extends SelectorDefTuple
    ? (...states: SelectorReturnTypeList<ParentsTuple>) => Return
    : () => any;

/**
 * Defines a selector function matching `SelectorSpec<ParentsTuple, Return>` but with the assumption that the
 * container state has been injected as the first argument.
 */
type SelectorSpecWithInjectedState<ParentsTuple, Return> = SelectorSpec<
  ParentsTuple extends SelectorDefTuple ? [any, ...ParentsTuple] : [any],
  ParentsTuple extends SelectorDefTuple ? Return : any
>;

/**
 * Defines a property descriptor for the `@Selector` decorator that decorates a function with
 * parent selectors/states/tokens `ParentsTuple` and return type `Return`.
 */
type DescriptorWithNoInjectedState<ParentsTuple, Return> = TypedPropertyDescriptor<
  SelectorSpec<ParentsTuple, Return>
>;

/**
 * Same as `DescriptorWithNoInjectedState` but with state injected as the first argument.
 */
type DescriptorWithInjectedState<ParentsTuple, Return> = TypedPropertyDescriptor<
  SelectorSpecWithInjectedState<ParentsTuple, Return>
>;

type DecoratorArgs<Descriptor> = [target: any, key: string | symbol, descriptor?: Descriptor];

/**
 * Defines the return type of a call to `@Selector` when there is no argument given
 * (e.g. `@Selector()` counts, but `@Selector([])` does not)
 *
 * This result is a decorator that can only be used to decorate a function with no arguments or a
 * single argument that is the container state.
 */
type SelectorTypeNoDecoratorArgs = {
  <Return>(
    ...args: DecoratorArgs<DescriptorWithNoInjectedState<unknown, Return>>
  ): void | DescriptorWithNoInjectedState<unknown, Return>;
  <Return>(
    ...args: DecoratorArgs<DescriptorWithInjectedState<unknown, Return>>
  ): void | DescriptorWithInjectedState<unknown, Return>;
};

/**
 * Defines the return type of a call to `@Selector` when there is an argument given.
 * (e.g. `@Selector([])` counts, but `@Selector()` does not)
 *
 * This result is a decorator that can only be used to decorate a function with an argument list
 * matching the results of the tuple of parents `ParentsTuple`.
 */
type SelectorTypeWithDecoratorArgs<ParentsTuple> = {
  <Return>(
    ...args: DecoratorArgs<DescriptorWithNoInjectedState<ParentsTuple, Return>>
  ): void | DescriptorWithNoInjectedState<ParentsTuple, Return>;
  /**
   * @deprecated
   * Read the deprecation notice at this link: https://ngxs.io/deprecations/inject-container-state-deprecation.md.
   */
  <Return>(
    ...args: DecoratorArgs<DescriptorWithInjectedState<ParentsTuple, Return>>
  ): void | DescriptorWithInjectedState<ParentsTuple, Return>;
};

/**
 * Defines the return type of a call to `@Selector`. This result is a decorator that can only be
 * used to decorate a function with an argument list matching `ParentsTuple`, the results of the
 * tuple of parent selectors/state tokens/state classes.
 */
export type SelectorType<ParentsTuple> = unknown extends ParentsTuple
  ? SelectorTypeNoDecoratorArgs
  : SelectorTypeWithDecoratorArgs<ParentsTuple>;
