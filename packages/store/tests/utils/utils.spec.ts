import { TestBed } from '@angular/core/testing';
import { setValue } from '@ngxs/store/plugins';
import { ɵPlainObject } from '@ngxs/store/internals';
import { provideStore } from '@ngxs/store';

import { ɵPROP_GETTER } from '../../src/internal/internals';

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
      TestBed.configureTestingModule({
        providers: [
          provideStore([], {
            compatibility: {
              strictContentSecurityPolicy: false
            }
          })
        ]
      });
      const propGetter = TestBed.inject(ɵPROP_GETTER);

      const target: ɵPlainObject = { a: { b: { c: 100 } } };

      expect(propGetter(['a', 'b', 'c'])(target)).toEqual(100);
      expect(propGetter(['a', 'b'])(target)).toEqual({ c: 100 });
    });

    it('strictContentSecurityPolicy: true', () => {
      TestBed.configureTestingModule({
        providers: [
          provideStore([], {
            compatibility: {
              strictContentSecurityPolicy: true
            }
          })
        ]
      });
      const propGetter = TestBed.inject(ɵPROP_GETTER);

      const target: ɵPlainObject = { a: { b: { c: 100 } } };

      expect(propGetter(['a', 'b', 'c'])(target)).toEqual(100);
      expect(propGetter(['a', 'b'])(target)).toEqual({ c: 100 });
    });
  });
});
