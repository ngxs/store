// internals.d.ts
export type Predicate<T = any> = (value: T | Readonly<T>) => boolean;
// utils.d.ts
export type RepairType<T> = T extends true
  ? boolean
  : T extends false
  ? boolean
  : T extends number
  ? number
  : T extends string
  ? string
  : T;

export type NoInfer<T> = [T][T extends any ? 0 : never];
// export type NoInfer<T> = T extends unknown ? T : T extends undefined ? T : T extends infer S ? S : never;

export {};
