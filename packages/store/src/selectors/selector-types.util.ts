import { ɵStateClass, StateToken } from '@ngxs/store/internals';

export type SelectorFunc<TModel> = (...arg: any[]) => TModel;

export type TypedSelector<TModel> = StateToken<TModel> | SelectorFunc<TModel>;

export type StateSelector = ɵStateClass<any>;

export type SelectorDef<TModel> = StateSelector | TypedSelector<TModel>;

export type SelectorReturnType<T extends SelectorDef<any>> =
  T extends StateToken<infer R1>
    ? R1
    : T extends SelectorFunc<infer R2>
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
