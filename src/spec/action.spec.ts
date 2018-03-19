import { Action } from '../action';
import { State } from '../state';
import { ensureStoreMetadata } from '../internals';

describe('Action', () => {
  it('supports multiple actions', () => {
    class Action1 {}
    class Action2 {}

    @State({
      name: 'bar'
    })
    class BarStore {
      @Action([Action1, Action2])
      foo({ setState }) {
        setState({ foo: false });
      }
    }

    const meta = ensureStoreMetadata(BarStore);
    expect(meta.actions['Action1']).toBeDefined();
    expect(meta.actions['Action2']).toBeDefined();
  });
});
