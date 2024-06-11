import { ɵStateClass, StateToken } from '@ngxs/store/internals';

export type ɵSelectorFunc<TModel> = (...arg: any[]) => TModel;

export type TypedSelector<TModel> = StateToken<TModel> | ɵSelectorFunc<TModel>;

export type ɵStateSelector = ɵStateClass<any>;

export type ɵSelectorDef<TModel> = ɵStateSelector | TypedSelector<TModel>;

export type ɵSelectorReturnType<T extends ɵSelectorDef<any>> =
  T extends StateToken<infer R1>
    ? R1
    : T extends ɵSelectorFunc<infer R2>
      ? R2
      : T extends ɵStateClass<any>
        ? any /* (Block comment to stop prettier breaking the comment below)
  // If the state selector is a class then we should infer its return type to `any`, and not to `unknown`.
  // Since we'll get an error that `Type 'unknown' is not assignable to type 'AuthStateModel'.`
  // The `unknown` type is not overridable when the strict mode is enabled:
  // function doSomethingWithArray(array: number[], factory: (x: unknown) => void) {
  //   array.forEach(factory);
  // }
  // doSomethingWithArray([1, 2], (x: number) => console.log(x));
  //                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //                              Type 'unknown' is not assignable to type 'number'.
  */
        : never;
