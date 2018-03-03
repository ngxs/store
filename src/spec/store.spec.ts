import { ensureStoreMetadata } from '../internals';
import { Store } from '../store';

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
});
