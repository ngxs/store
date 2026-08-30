import { createEnvironmentInjector, EnvironmentInjector, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, provideStates, Selector, State, Store } from '@ngxs/store';

import { StateFactory } from '../src/internal/state-factory';

describe('Store bound-selector caching', () => {
  interface CounterModel {
    count: number;
  }

  @State<CounterModel>({ name: 'counter', defaults: { count: 3 } })
  @Injectable()
  class CounterState {
    @Selector()
    static getCount(state: CounterModel): number {
      return state.count;
    }
  }

  @State<number>({ name: 'lazy', defaults: 42 })
  @Injectable()
  class LazyState {
    @Selector()
    static getValue(state: number): number {
      return state;
    }
  }

  function setup() {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])]
    });
    return {
      store: TestBed.inject(Store),
      stateFactory: TestBed.inject(StateFactory)
    };
  }

  it('reuses the bound selector function across repeated reads', () => {
    // Arrange
    const { store, stateFactory } = setup();
    // Warm the cache.
    expect(store.selectSnapshot(CounterState.getCount)).toBe(3);

    const contextSpy = jest.spyOn(stateFactory, 'getRuntimeSelectorContext');

    // Act — read the same selector many more times.
    for (let i = 0; i < 10; i++) {
      store.selectSnapshot(CounterState.getCount);
      store.select(CounterState.getCount);
    }

    // Assert — the wiring was not rebuilt again.
    expect(contextSpy).not.toHaveBeenCalled();
  });

  it('still returns correct values on every read', () => {
    // Arrange
    const { store } = setup();

    // Assert
    expect(store.selectSnapshot(CounterState.getCount)).toBe(3);
    store.reset({ counter: { count: 99 } });
    expect(store.selectSnapshot(CounterState.getCount)).toBe(99);
    expect(store.selectSnapshot(CounterState.getCount)).toBe(99);
  });

  it('rebuilds the cached function when new states are registered later', () => {
    // Arrange
    const { store, stateFactory } = setup();
    // Warm the cache for an existing selector.
    store.selectSnapshot(CounterState.getCount);

    const contextSpy = jest.spyOn(stateFactory, 'getRuntimeSelectorContext');

    // Act — register a feature state after the fact.
    const parent = TestBed.inject(EnvironmentInjector);
    createEnvironmentInjector([provideStates([LazyState])], parent);

    // Assert — the generation moved, so the next read rebuilds once, then caches.
    expect(store.selectSnapshot(CounterState.getCount)).toBe(3);
    expect(store.selectSnapshot(LazyState.getValue)).toBe(42);
    expect(contextSpy).toHaveBeenCalledTimes(2);

    contextSpy.mockClear();
    store.selectSnapshot(CounterState.getCount);
    store.selectSnapshot(LazyState.getValue);
    expect(contextSpy).not.toHaveBeenCalled();
  });
});
