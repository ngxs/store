import type { StateToken } from './state-token';

export interface ɵPlainObject {
  [key: string]: any;
}

export interface ɵPlainObjectOf<T> {
  [key: string]: T;
}

export type ɵStateClass<T = any> = new (...args: any[]) => T;

// This key is used to store metadata on state classes,
// such as actions and other related information.
export const ɵMETA_KEY = 'NGXS_META';
// This key is used to store options on state classes
// provided through the `@State` decorator.
export const ɵMETA_OPTIONS_KEY = 'NGXS_OPTIONS_META';
// This key is used to store selector metadata on selector functions,
// such as decorated with the `@Selector` or provided through the
// `createSelector` function.
export const ɵSELECTOR_META_KEY = 'NGXS_SELECTOR_META';

export interface ɵStateToken<T, U> {
  new (name: ɵTokenName<T>): U;
  getName(): string;
  toString(): string;
}

type RequireGeneric<T, U> = T extends void ? 'You must provide a type parameter' : U;

export type ɵTokenName<T> = string & RequireGeneric<T, string>;

export type ɵExtractTokenType<P> = P extends StateToken<infer T> ? T : never;

/**
 * Options that can be provided to the store.
 */
export interface ɵStoreOptions<T> {
  /**
   * Name of the state. Required.
   */
  name: string | StateToken<T>;

  /**
   * Default values for the state. If not provided, uses empty object.
   */
  defaults?: T;

  /**
   * Sub states for the given state.
   */
  children?: ɵStateClass[];
}

// inspired from https://stackoverflow.com/a/43674389
export interface ɵStateClassInternal<T = any, U = any> extends ɵStateClass<T> {
  [ɵMETA_KEY]?: ɵMetaDataModel;
  [ɵMETA_OPTIONS_KEY]?: ɵStoreOptions<U>;
}

export interface ɵMetaDataModel {
  name: string | null;
  actions: ɵPlainObjectOf<ɵActionHandlerMetaData[]>;
  defaults: any;
  path: string | null;
  makeRootSelector: ɵSelectorFactory | null;
  children?: ɵStateClassInternal[];
}

export interface ɵSelectorMetaDataModel {
  makeRootSelector: ɵSelectorFactory | null;
  originalFn: Function | null;
  containerClass: any;
  selectorName: string | null;
  getSelectorOptions: () => ɵSharedSelectorOptions;
}

export interface ɵSharedSelectorOptions {
  injectContainerState?: boolean;
  suppressErrors?: boolean;
}

export interface ɵRuntimeSelectorContext {
  getStateGetter(key: any): (state: any) => any;
  getSelectorOptions(localOptions?: ɵSharedSelectorOptions): ɵSharedSelectorOptions;
}

export type ɵSelectFromRootState = (rootState: any) => any;
export type ɵSelectorFactory = (
  runtimeContext: ɵRuntimeSelectorContext
) => ɵSelectFromRootState;

/**
 * Actions that can be provided in a action decorator.
 */
export interface ɵActionOptions {
  /**
   * Cancel the previous uncompleted observable(s).
   */
  cancelUncompleted?: boolean;
}

export interface ɵActionHandlerMetaData {
  fn: string | symbol;
  options: ɵActionOptions;
  type: string;
}
