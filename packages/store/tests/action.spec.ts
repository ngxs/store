import { Action } from '../src/action';
import { State } from '../src/state';
import { META_KEY } from '../src/symbols';

describe('Action', () => {
  it('supports multiple actions', () => {
    class Action1 {
      static type = 'ACTION 1';
    }

    class Action2 {
      static type = 'ACTION 2';
    }

    @State({
      name: 'bar'
    })
    class BarStore {
      @Action([Action1, Action2])
      foo() {}
    }

    const meta = BarStore[META_KEY];

    expect(meta.actions[Action1.type]).toBeDefined();
    expect(meta.actions[Action2.type]).toBeDefined();
  });
});
