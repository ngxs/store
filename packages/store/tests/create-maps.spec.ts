import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Selector,
  State,
  createDispatchMap,
  createSelectMap,
  provideStore
} from '@ngxs/store';

describe('create maps', () => {
  class Increment {
    static readonly type = 'Increment';
  }

  @State({
    name: 'number',
    defaults: 0
  })
  @Injectable()
  class NumberState {
    @Selector()
    static getNumberState(state: number) {
      return state;
    }
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [provideStore([NumberState])]
    });
  };

  describe('createSelectMap', () => {
    it('should allow listing properties through Object.keys', () => {
      // Arrange
      testSetup();

      // Act
      const selectors = TestBed.runInInjectionContext(() =>
        createSelectMap({
          number: NumberState.getNumberState
        })
      );

      // Assert
      expect(selectors.number()).toEqual(0);
      expect(Object.keys(selectors)).toEqual(['number']);
    });
  });

  describe('createDispatchMap', () => {
    it('should allow listing properties through Object.keys', () => {
      // Arrange
      testSetup();

      // Act
      const dispatchers = TestBed.runInInjectionContext(() =>
        createDispatchMap({
          increment: Increment
        })
      );

      // Assert
      expect(Object.keys(dispatchers)).toEqual(['increment']);
    });
  });
});
