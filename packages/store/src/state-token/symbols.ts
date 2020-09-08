import { StateToken } from './state-token';

type RequireGeneric<T, U> = T extends void ? 'You must provide a type parameter' : U;

export type TokenName<T> = string & RequireGeneric<T, string>;

export type ExtractTokenType<P> = P extends StateToken<infer T> ? T : never;
