import { setValue } from '../../src/utils/utils';
import { merge } from '../../src/internal/internals';

describe('utils', () => {
  describe('setValue', () => {
    it('should set the value in the path', () => {
      const state = {
        cart: {
          saved: {
            items: []
          },
          new: ['Foo']
        },
        other: 'bar'
      };

      const newState = setValue(state, 'cart.saved.items', ['Item1']);

      expect(newState).toEqual({
        cart: {
          saved: {
            items: ['Item1']
          },
          new: ['Foo']
        },
        other: 'bar'
      });
    });

    it('should set the value in the path (when key name is repeated)', () => {
      const state = {
        items: {
          saved: {
            items: []
          },
          new: ['Foo']
        },
        other: 'bar'
      };

      const newState = setValue(state, 'items.saved.items', ['Item1']);

      expect(newState).toEqual({
        items: {
          saved: {
            items: ['Item1']
          },
          new: ['Foo']
        },
        other: 'bar'
      });
    });
  });

  it('should be correct merged', () => {
    class A {
      public value = 'hello world';
    }

    expect(merge(null as any, null as any)).toEqual({});
    expect(merge(new A(), { id: 0 })).toEqual({ value: 'hello world', id: 0 });
  });
});
