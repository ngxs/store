import { findFullParentPath, topologicalSort } from '../src/internal/internals';

describe('graph', () => {
  it('should build graph', () => {
    const t = {
      cart: ['saved'],
      saved: ['items'],
      items: []
    };

    const r = {
      cart: 'cart',
      saved: 'cart.saved',
      items: 'cart.saved.items'
    };

    const actual = findFullParentPath(t);
    expect(actual).toEqual(r);
  });

  it('order should not matter', () => {
    const t = {
      saved: ['items'],
      items: [],
      cart: ['saved']
    };

    const r = {
      cart: 'cart',
      saved: 'cart.saved',
      items: 'cart.saved.items'
    };

    const actual = findFullParentPath(t);
    expect(actual).toEqual(r);
  });

  it('should correctly sort dependencies', () => {
    const sorted = topologicalSort({
      saved: ['items'],
      items: [],
      cart: ['saved']
    });

    expect(sorted).toEqual(['cart', 'saved', 'items']);
  });
});
