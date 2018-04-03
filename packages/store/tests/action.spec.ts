import { Action, ActionToken } from '../src/action';
import { State } from '../src/state';
import { META_KEY } from '../src/symbols';

describe('Action', () => {
  it('supports multiple actions', () => {
    class Action1 {
      static type = 'ACTION 1';
    }

    class Action2 {}

    @State({
      name: 'bar'
    })
    class BarStore {
      @Action([Action1, Action2])
      foo() {}
    }

    const meta = BarStore[META_KEY];

    expect(meta.actions[Action1.type]).toBeDefined();
    expect(meta.actions[(<ActionToken>Action2['type']).toString()]).toBeDefined();

    // NOTE: becuase Jasmine type will change when more actions are added to tests.
    expect((<ActionToken>Action2['type']).toString()).toBe('ActionToken Action2 5');
  });
});
