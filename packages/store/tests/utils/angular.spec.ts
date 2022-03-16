import { ɵglobal } from '@angular/core';

import { isAngularInTestMode } from '@ngxs/store/internals';

describe('[utils/angular]', () => {
  describe('isAngularInTestMode', () => {
    // Just an empty object so `typeof !== undefined` will be truthy.
    const nonUndefinedValue = {};

    it('should return true if `__karma__` is available', () => {
      // Arrange & act & assert
      const __karma__ = ɵglobal.__karma__;
      ɵglobal.__karma__ = nonUndefinedValue;
      expect(isAngularInTestMode()).toEqual(true);
      ɵglobal.__karma__ = __karma__;
    });

    it('should return true if `jasmine` is available', () => {
      // Arrange & act & assert
      const jasmine = ɵglobal.jasmine;
      ɵglobal.jasmine = nonUndefinedValue;
      expect(isAngularInTestMode()).toEqual(true);
      ɵglobal.jasmine = jasmine;
    });

    it('should return true if `jest` is available', () => {
      // Arrange & act & assert
      const jest = ɵglobal.jest;
      ɵglobal.jest = nonUndefinedValue;
      expect(isAngularInTestMode()).toEqual(true);
      ɵglobal.jest = jest;
    });

    it('should return true if `Mocha` is available', () => {
      // Arrange & act & assert
      const Mocha = ɵglobal.Mocha;
      ɵglobal.Mocha = nonUndefinedValue;
      expect(isAngularInTestMode()).toEqual(true);
      ɵglobal.Mocha = Mocha;
    });

    it('should return false if any of the values are globally available', () => {
      // Arrange & act & assert
      const __karma__ = ɵglobal.__karma__;
      const jasmine = ɵglobal.jasmine;
      const jest = ɵglobal.jest;
      const Mocha = ɵglobal.Mocha;
      delete ɵglobal.__karma__;
      delete ɵglobal.jasmine;
      delete ɵglobal.jest;
      delete ɵglobal.Mocha;
      expect(isAngularInTestMode()).toEqual(false);
      ɵglobal.__karma__ = __karma__;
      ɵglobal.jasmine = jasmine;
      ɵglobal.jest = jest;
      ɵglobal.Mocha = Mocha;
    });
  });
});
