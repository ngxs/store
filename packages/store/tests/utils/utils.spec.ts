import { PlainObject } from '@ngxs/store/internals';
import { propGetter } from '../../src/internal/internals';
import { setValue } from '../../src/utils/utils';
import { NgxsConfig } from '../../src/symbols';

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

  describe('propGetter', () => {
    it('strictContentSecurityPolicy: false', () => {
      const config: NgxsConfig = new NgxsConfig();
      const target: PlainObject = { a: { b: { c: 100 } } };

      expect(propGetter(['a', 'b', 'c'], config)(target)).toEqual(100);
      expect(propGetter(['a', 'b'], config)(target)).toEqual({ c: 100 });
    });

    it('strictContentSecurityPolicy: true', () => {
      const defaultConfig: NgxsConfig = new NgxsConfig();
      const config: NgxsConfig = {
        ...defaultConfig,
        compatibility: {
          ...defaultConfig.compatibility,
          strictContentSecurityPolicy: true
        }
      };

      const target: PlainObject = { a: { b: { c: 100 } } };

      expect(propGetter(['a', 'b', 'c'], config)(target)).toEqual(100);
      expect(propGetter(['a', 'b'], config)(target)).toEqual({ c: 100 });
    });
  });
});
