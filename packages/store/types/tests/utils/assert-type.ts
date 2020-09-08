export type Callback<T> = (...args: any[]) => T;

export function assertType<T>(callback: Callback<T>): T {
  return callback();
}
