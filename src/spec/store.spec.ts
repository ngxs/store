import { ensureStoreMetadata } from '../internals';
import { Store } from '../store';
import { Mutation } from '../mutation';

describe('Store', () => {
  it('infers correct name', () => {
    @Store({})
    class BarStore {}

    const meta = ensureStoreMetadata(BarStore);
    expect(meta.name).toBe('bar');
  });

  it('infers correct name without suffix', () => {
    @Store({})
    class Bar {}

    const meta = ensureStoreMetadata(Bar);
    expect(meta.name).toBe('bar');
  });

  it('describes correct name', () => {
    @Store({
      name: 'moo'
    })
    class BarStore {}

    const meta = ensureStoreMetadata(BarStore);
    expect(meta.name).toBe('moo');
  });

  it('handles extending', () => {
    class Eat {}
    class Drink {}
    @Store({
      name: 'moo'
    })
    class BarStore {
      @Mutation(Eat)
      eat() {}
    }

    @Store({
      name: 'moo'
    })
    class BarS2tore extends BarStore {
      @Mutation(Drink)
      drink() {}
    }

    const meta = ensureStoreMetadata(BarS2tore);
    expect(meta.mutations['Eat']).toBeDefined();
    expect(meta.mutations['Drink']).toBeDefined();
  });
});
