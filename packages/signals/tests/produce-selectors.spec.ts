import { Injectable, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Selector, State, provideStore } from '@ngxs/store';
import { produceSelectors } from '@ngxs/signals';

describe('produceSelectors', () => {
  @State({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Selector()
    static getCounter(state: number) {
      return state;
    }
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      providers: [provideStore([CounterState])]
    });
  };

  it('should select counter as a signal', () => {
    // Arrange
    testSetup();

    // Act
    const selectors = runInInjectionContext(TestBed, () =>
      produceSelectors({
        counter: CounterState.getCounter
      })
    );

    // Assert
    expect(selectors.counter()).toEqual(0);
  });

  it('should produce a readonly property', () => {
    // Arrange
    testSetup();

    // Act
    const selectors = runInInjectionContext(TestBed, () =>
      produceSelectors({
        counter: CounterState.getCounter
      })
    );

    let message: string | null = null;

    try {
      (selectors as any).counter = {};
    } catch (error) {
      message = error.message;
    }

    // Assert
    expect(message).toContain('Cannot assign to read only property');
  });
});
