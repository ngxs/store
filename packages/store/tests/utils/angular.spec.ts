import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { getPlatform, platformCore } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import {
  platformBrowserDynamicTesting,
  BrowserDynamicTestingModule
} from '@angular/platform-browser-dynamic/testing';
import { getTestBed } from '@angular/core/testing';
import { isAngularInTestMode } from '@ngxs/store/internals';

describe('[utils/angular]', () => {
  describe('isAngularInTestMode', () => {
    function resetEnv() {
      const fn = <any>isAngularInTestMode;
      // Reset the memoization
      fn && fn.reset && fn.reset();

      // Reset the angular platform
      const p = <any>getPlatform();
      p && p.destroy && p.destroy();
    }

    beforeEach(() => {
      resetEnv();
    });

    afterEach(() => {
      resetEnv();

      getTestBed().resetTestEnvironment();
      getTestBed().initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting()
      );
    });

    it(`should return true if the Angular Test Module has been bootstrapped`, () => {
      // Arrange
      platformBrowserDynamicTesting();
      // Act
      const result = isAngularInTestMode();
      // Assert
      expect(result).toEqual(true);
    });

    it(`should return false if Angular has not been bootstrapped`, () => {
      // Arrange

      // Act
      const result = isAngularInTestMode();
      // Assert
      expect(result).toEqual(false);
    });

    it(`should return false if the Angular platformBrowserDynamic has been bootstrapped`, async () => {
      // Arrange
      platformBrowserDynamic();
      // Act
      const result = isAngularInTestMode();
      // Assert
      expect(result).toEqual(false);
    });

    it(`should return false if the Angular platformBrowser has been bootstrapped`, async () => {
      // Arrange
      platformBrowser();
      // Act
      const result = isAngularInTestMode();
      // Assert
      expect(result).toEqual(false);
    });

    it(`should return false if the Angular platformCore has been bootstrapped`, async () => {
      // Arrange
      platformCore();
      // Act
      const result = isAngularInTestMode();
      // Assert
      expect(result).toEqual(false);
    });
  });
});
