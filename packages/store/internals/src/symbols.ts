/**
 * @internal
 */
export interface PlainObject {
  [key: string]: any;
}

/**
 * @internal
 */
export interface PlainObjectOf<T> {
  [key: string]: T;
}

/**
 * @internal
 */
export type StateClass<T = any> = new (...args: any[]) => T;
