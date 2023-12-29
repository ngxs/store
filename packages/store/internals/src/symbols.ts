export interface PlainObject {
  [key: string]: any;
}

export interface PlainObjectOf<T> {
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
