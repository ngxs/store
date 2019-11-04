import { StateToken } from './state-token';
import { StateClassInternal } from '../internal/internals';

type RequireGeneric<T, U> = T extends void ? 'You must provide a type parameter' : U;

export interface StateTokenStructure {
  name: string;
  tokenInstance: StateToken<any>;
}

export type StateClassToken<T> = StateClassInternal & RequireGeneric<T, StateClassInternal>;

export type TokenName<T> = string & RequireGeneric<T, string>;

export type ExtractTokenType<P> = P extends StateToken<infer T> ? T : never;
