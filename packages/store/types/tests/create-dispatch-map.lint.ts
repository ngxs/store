/// <reference types="@types/jest" />

import { createDispatchMap } from '@ngxs/store';

describe('[TEST]: createDispatchMap', () => {
  it('should error on invalid use cases', () => {
    class ActionWithoutType {
      constructor(readonly event: MessageEvent) {}
    }

    createDispatchMap(); // $ExpectError
    createDispatchMap({}); // $ExpectError

    createDispatchMap({
      action: ActionWithoutType // $ExpectError
    });

    createDispatchMap({
      action: { // $ExpectError
        type: 'Plain Object'
      }
    });
  });

  it('should infer correct return types', () => {
    class ValidAction {
      static readonly type = 'Valid Action';

      constructor(readonly name: string) {}
    }
  
    class ValidActionWithMultipleParameters {
      static readonly type = 'Valid Action';

      constructor(readonly name_1: string, readonly name_2: number) {}
    }

    createDispatchMap({ action: ValidAction }); // $ExpectType { readonly action: (name: string) => Observable<void>; }
    createDispatchMap({ action: ValidAction, action_2: ValidActionWithMultipleParameters }); // $ExpectType { readonly action: (name: string) => Observable<void>; readonly action_2: (name_1: string, name_2: number) => Observable<void>; }
  });
});
