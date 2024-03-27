// There's no reason to call the following function with an empty object as
// `createDispatchMap({})` or `createSelectMap({})`. We should prevent invalid
// or incorrect use cases.
export type RequireAtLeastOneProperty<T> = keyof T extends never ? never : T;
