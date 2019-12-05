/// <reference types="@types/jest" />

import { Store } from '@ngxs/store';
import { assertType } from './utils/assert-type';

describe('[TEST]: Action Types', () => {
  let store: Store;

  it('should be correct return type from reset', () => {
    interface MyAppState {
      a: number;
      b: number;
    }

    const newState: MyAppState = { a: 1, b: 2 };

    assertType(() => store.reset(newState)); // $ExpectType MyAppState
    assertType(() => store.reset({ c: 3, d: '4' })); // $ExpectType { c: number; d: string; }
    assertType(() => store.reset('Hello World')); // $ExpectType string
    assertType(() => store.reset(NaN)); // $ExpectType number
    assertType(() => store.reset([])); // $ExpectType never[]
    assertType(() => store.reset(null)); // $ExpectType null
  });
});
