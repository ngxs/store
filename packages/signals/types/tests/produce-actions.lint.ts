/// <reference types="@types/jest" />

import { produceActions } from '../../';

describe('[TEST]: produceActions', () => {
  it('should error on invalid use cases', () => {
    class ActionWithoutType {
      constructor(readonly event: MessageEvent) {}
    }

    produceActions(); // $ExpectError
    produceActions({}); // $ExpectError

    produceActions({
      action: ActionWithoutType // $ExpectError
    });

    produceActions({
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

    produceActions({ action: ValidAction }); // $ExpectType { action: (name: string) => Observable<void>; }
    produceActions({ action: ValidAction, action_2: ValidActionWithMultipleParameters }); // $ExpectType { action: (name: string) => Observable<void>; action_2: (name_1: string, name_2: number) => Observable<void>; }
  });
});
