import { StateToken } from '../../state-token/state-token';
import { ExtractTokenType } from '../../state-token/symbols';

export type SelectorSpec<T, U> = [T] extends [never]
  ? ((...states: any[]) => any)
  : (T extends StateToken<any>
      ? (state: ExtractTokenType<T>) => U
      : (...states: any[]) => any);

export type SelectorType<T> = <U>(
  target: any,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<SelectorSpec<T, U>>
) => TypedPropertyDescriptor<SelectorSpec<T, U>> | void;
