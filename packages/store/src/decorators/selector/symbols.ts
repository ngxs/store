import { SelectorDef, SelectorReturnType } from '../../selectors';

export type SelectorDefTuple = SelectorDef<any>[] | [SelectorDef<any>];

type UnknownToAny<T> = unknown extends T ? any : T;
type EnsureArray<T> = T extends any[] ? T : never;

type SelectorReturnTypeList<T extends SelectorDefTuple> = EnsureArray<{
  [K in keyof T]: T[K] extends SelectorDef<any>
    ? UnknownToAny<SelectorReturnType<T[K]>>
    : never;
}>;

export type SelectorSpec<T, U> = T extends []
  ? () => any
  : T extends SelectorDefTuple
  ? (...states: SelectorReturnTypeList<T>) => U
  : () => any;

type SelectorSpecWithInjectedState<T, U> = SelectorSpec<
  T extends SelectorDefTuple ? [any, ...T] : [any],
  T extends SelectorDefTuple ? U : any
>;

type DescriptorWithNoInjectedState<T, U> = TypedPropertyDescriptor<SelectorSpec<T, U>>;
type DescriptorWithInjectedState<T, U> = TypedPropertyDescriptor<
  SelectorSpecWithInjectedState<T, U>
>;

type DecoratorArgs<T> = [target: any, key: string | symbol, descriptor?: T];

export type SelectorType<T> = {
  <U>(
    ...args: DecoratorArgs<DescriptorWithNoInjectedState<T, U>>
  ): void | DescriptorWithNoInjectedState<T, U>;
  <U>(
    ...args: DecoratorArgs<DescriptorWithInjectedState<T, U>>
  ): void | DescriptorWithInjectedState<T, U>;
};
