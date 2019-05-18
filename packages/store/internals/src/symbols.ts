export interface ObjectKeyMap<T> {
  [key: string]: T;
}

export type StateClass<T = any> = new (...args: any[]) => T;
