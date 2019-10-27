import { ObjectUtils } from '@ngxs/store/internals';
import { State } from '@ngxs/store';

import { isStateClass, setValue } from '../../src/utils/utils';
import { META_KEY } from '../../src/symbols';

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

    expect(ObjectUtils.merge(null as any, null as any)).toEqual({});
    expect(ObjectUtils.merge(new A(), { id: 0 })).toEqual({ value: 'hello world', id: 0 });
  });

  it('should be check class is state or non state', () => {
    class NonState {}

    @State({ name: 'myState' })
    class StateClass {}

    expect(isStateClass(null!)).toEqual(false);
    expect(isStateClass((() => {}) as any)).toEqual(false);
    expect(isStateClass(NonState)).toEqual(false);
    expect(isStateClass({ [META_KEY]: {} } as any)).toEqual(false);
    expect(isStateClass(StateClass)).toEqual(true);
  });
});
