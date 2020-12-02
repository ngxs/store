import { PlainObject } from '@ngxs/store/internals';
import { propGetter } from '../../src/internal/internals';
import { setValue, isObject, mergeDeep } from '../../src/utils/utils';
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

  describe('isObject', () => {
    it('should correctly identify objects', () => {
      const object = { a: 1 };
      const constructedObject = new Object(1);
      const array = [1, 2, 3];
      const string = 'asdasd';
      const number = 12;

      expect(isObject(object)).toBeTruthy();
      expect(isObject(constructedObject)).toBeTruthy();
      expect(isObject(array)).toBeFalsy();
      expect(isObject(string)).toBeFalsy();
      expect(isObject(number)).toBeFalsy();

      expect(isObject(null)).toBeFalsy();
      expect(isObject(undefined)).toBeFalsy();
    });
  });

  describe('mergeDeep', () => {
    it('should merge properties from two objects', () => {
      const base = { a: 1, b: 2 };
      const source = { c: 3 };

      expect(mergeDeep(base, source)).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should merge properties from multiple objects', () => {
      const base = { a: 1, b: 2 };
      const sources = [{ c: 3 }, { d: 4 }, { e: 5 }];

      expect(mergeDeep(base, sources[0], sources[1], sources[2])).toEqual({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5
      });
    });

    it('should merge subproperties from two objects ', () => {
      const base = { a: 1, b: { x: 2, z: { c: 1 } } };
      const source = { b: { y: 3, z: { d: 2 }, w: { f: 1 } } };

      expect(mergeDeep(base, source)).toEqual({
        a: 1,
        b: { x: 2, y: 3, z: { c: 1, d: 2 }, w: { f: 1 } }
      });
    });

    it('should overwrite properties of base object with source object', () => {
      const base = { a: 1, b: 2 };
      const source = { c: 3, b: 4 };

      expect(mergeDeep(base, source)).toEqual({ a: 1, b: 4, c: 3 });
    });

    it('should overwrite properties in the correct order', () => {
      const base = { a: 1, b: 2 };
      const sources = [{ c: 3, b: 4, d: 6 }, { c: 5 }, { b: 7 }];

      expect(mergeDeep(base, sources[0], sources[1], sources[2])).toEqual({
        a: 1,
        b: 7,
        c: 5,
        d: 6
      });
    });
  });
});
