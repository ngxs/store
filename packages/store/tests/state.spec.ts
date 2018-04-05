import { ensureStoreMetadata } from '../src/internals';
import { State } from '../src/state';
import { Action } from '../src/action';

describe('Store', () => {
  it('describes correct name', () => {
    @State({
      name: 'moo'
    })
    class BarState {}

    const meta = ensureStoreMetadata(BarState);
    expect(meta.name).toBe('moo');
  });

  it('handles extending', () => {
    class Eat {
      static type = 'EAT';
    }
    class Drink {
      static type = 'DRINK';
    }

    @State({
      name: 'bar'
    })
    class BarStore {
      @Action(Eat)
      eat() {}
    }

    @State({
      name: 'bar2'
    })
    class BarS2tore extends BarStore {
      @Action(Drink)
      drink() {}
    }

    const meta = ensureStoreMetadata(BarS2tore);
    expect(meta.actions[Eat['type']]).toBeDefined();
    expect(meta.actions[Drink['type']]).toBeDefined();
  });
});
