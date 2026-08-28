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

  it('should not blow the stack on a cyclic graph', () => {
    const t = {
      a: ['b'],
      b: ['a']
    };

    // Before the fix this threw `RangeError: Maximum call stack size exceeded`
    // in production builds (the clean cycle error is dev-only).
    expect(() => findFullParentPath(t)).not.toThrow();
    const actual = findFullParentPath(t);
    expect(Object.keys(actual).sort()).toEqual(['a', 'b']);
  });

  it('should not blow the stack on a self-referencing node', () => {
    const t = {
      a: ['a']
    };

    expect(() => findFullParentPath(t)).not.toThrow();
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
