import { Action } from '../action';
import { State } from '../state';
import { ensureStoreMetadata } from '../internals';

describe('Action', () => {
  it('supports multiple actions', () => {
    class Action1 {}
    class Action2 {}

    @State({})
    class BarStore {
      @Action([Action1, Action2])
      foo() {}
    }

    const meta = ensureStoreMetadata(BarStore);
    expect(meta.actions['Action1']).toBeDefined();
    expect(meta.actions['Action2']).toBeDefined();
  });
});
