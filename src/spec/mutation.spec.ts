import { Mutation } from '../mutation';
import { Store } from '../store';
import { ensureStoreMetadata } from '../internals';

describe('Mutation', () => {
  it('supports multiple actions', () => {
    class Mutation1 {}
    class Mutation2 {}

    @Store({})
    class BarStore {
      @Mutation([Mutation1, Mutation2])
      foo(state) {
        state.foo = false;
      }
    }

    const meta = ensureStoreMetadata(BarStore);
    expect(meta.mutations['Mutation1']).toBeDefined();
    expect(meta.mutations['Mutation2']).toBeDefined();
  });
});
