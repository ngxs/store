import { StateToken, ɵExtractTokenType } from '@ngxs/store/internals';

export type SelectorSpec<T, U> = [T] extends [never]
  ? (...states: any[]) => any
  : T extends StateToken<any>
    ? (state: ɵExtractTokenType<T>) => U
    : (...states: any[]) => any;

export type SelectorType<T> = <U>(
  target: any,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<SelectorSpec<T, U>>
) => TypedPropertyDescriptor<SelectorSpec<T, U>> | void;
