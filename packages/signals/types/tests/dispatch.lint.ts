/// <reference types="@types/jest" />

import { dispatch } from '../../';

describe('dispatch', () => {
  class OneArgumentAction {
    static type = 'OneArgumentAction';

    constructor(payload: string) {}
  }

  class ManyArgumentsAction {
    static type = 'ManyArguments';

    constructor(arg_1: string, arg_2: number, arg_3: symbol) {}
  }

  it('should expect types for dispatch', () => {
    dispatch([]); // $ExpectError
    dispatch(); // $ExpectError
    dispatch({}); // $ExpectError
    dispatch(FooAction); // $ExpectError
    dispatch(OneArgumentAction); // $ExpectType (payload: string) => Observable<void>
    dispatch(ManyArgumentsAction); // $ExpectType (arg_1: string, arg_2: number, arg_3: symbol) => Observable<void>
  });
})
