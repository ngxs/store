import { createEnvironmentInjector, EnvironmentInjector, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createApplication } from '@angular/platform-browser';
import {
  createModelSelector,
  createPickSelector,
  createPropertySelectors,
  createSelector,
  NgxsModule,
  provideStates,
  provideStore,
  Selector,
  State,
  Store
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('Shared runtime selectors', () => {
  interface CounterStateModel {
    count: number;
    nested?: { value: number };
  }

  @State<CounterStateModel>({ name: 'counter', defaults: { count: 0 } })
  @Injectable()
  class CounterState {}

  @State<string>({ name: 'other', defaults: 'initial' })
  @Injectable()
  class OtherState {}

  @State<number>({ name: 'feature', defaults: 42 })
  @Injectable()
  class FeatureState {
    @Selector()
    static getValue(state: number): number {
      return state;
    }
  }

  class CounterQueries {
    @Selector([CounterState])
    static plus(counter: CounterStateModel) {
      return (amount: number) => counter.count + amount;
    }
  }

  function setup(options: { suppressErrors?: boolean } = {}) {
    const { suppressErrors = false } = options;
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState, OtherState], { selectorOptions: { suppressErrors } })
      ]
    });
    const store = TestBed.inject(Store);
    return { store, ...createStateSetters(store) };
  }

  function createStateSetters(store: Store) {
    const setCounter = (counter: CounterStateModel) =>
      store.reset({ ...store.snapshot(), counter });
    const setCount = (count: number) => setCounter({ ...store.snapshot().counter, count });
    const setOther = (other: string) => store.reset({ ...store.snapshot(), other });
    return { setCounter, setCount, setOther };
  }

  // A plain function used as an argument selector receives the root state
  // directly, so its call count is the number of times the selector that
  // depends on it was walked.
  function createCountProbe() {
    return jest.fn((rootState: any): number => rootState.counter.count);
  }

  // `shared` is used by three parents, which are all used by `summary`.
  function createDiamondGraph() {
    const countProbe = createCountProbe();
    const sharedProjector = jest.fn((count: number) => ({ count }));
    const shared = createSelector([countProbe], sharedProjector);
    const doubled = createSelector([shared], ({ count }) => count * 2);
    const tripled = createSelector([shared], ({ count }) => count * 3);
    const label = createSelector([shared], ({ count }) => `count: ${count}`);
    const summary = createSelector([doubled, tripled, label], (d, t, l) => ({ d, t, l }));
    return { countProbe, sharedProjector, summary };
  }

  describe('results', () => {
    it('stays correct across many changes to the selected and unrelated slices', () => {
      // Arrange
      const { store, setCount, setOther } = setup();
      const projector = jest.fn((counter: CounterStateModel) => ({
        tens: counter.count * 10
      }));
      const selector = createSelector([CounterState], projector);
      let expectedCount = 0;
      store.selectSnapshot(selector);
      projector.mockClear();

      // Act & Assert
      for (let step = 1; step <= 20; step++) {
        const before = store.selectSnapshot(selector);
        if (step % 2 === 0) {
          expectedCount = step;
          setCount(step);
          expect(store.selectSnapshot(selector)).toEqual({ tens: expectedCount * 10 });
        } else {
          setOther(`other ${step}`);
          expect(store.selectSnapshot(selector)).toBe(before);
        }
      }
      expect(projector).toHaveBeenCalledTimes(10);
    });

    it('returns values from a lazily added state through a selector built before it was added', () => {
      // Arrange
      const { store } = setup();
      const doubled = createSelector([FeatureState.getValue], value =>
        value === undefined ? 'not registered' : value * 2
      );
      const values: (number | string)[] = [];
      const subscription = store.select(doubled).subscribe(value => values.push(value));
      expect(store.selectSnapshot(doubled)).toBe('not registered');

      // Act
      createEnvironmentInjector(
        [provideStates([FeatureState])],
        TestBed.inject(EnvironmentInjector)
      );
      subscription.unsubscribe();

      // Assert
      expect(store.selectSnapshot(doubled)).toBe(84);
      expect(values).toEqual(['not registered', 84]);
    });

    it('uses its own inputs when its projector function was already used by another selector', () => {
      // Arrange
      const { store } = setup();
      const identity = (value: unknown) => value;
      const counterSelector = createSelector([CounterState], identity);
      store.selectSnapshot(counterSelector);

      // Act
      const otherSelector = createSelector([OtherState], identity);

      // Assert
      expect(store.selectSnapshot(otherSelector)).toBe('initial');
    });
  });

  describe('errors', () => {
    function createNestedValueSelector() {
      const projector = jest.fn((counter: CounterStateModel) => counter.nested!.value);
      return { projector, selector: createSelector([CounterState], projector) };
    }

    it('returns undefined for a TypeError with suppressErrors and does not cache the failure', () => {
      // Arrange
      const { store, setCounter } = setup({ suppressErrors: true });
      const { projector, selector } = createNestedValueSelector();

      // Act
      const firstResult = store.selectSnapshot(selector);
      const secondResult = store.selectSnapshot(selector);
      setCounter({ count: 1, nested: { value: 7 } });
      const validResult = store.selectSnapshot(selector);

      // Assert
      expect(firstResult).toBeUndefined();
      expect(secondResult).toBeUndefined();
      expect(projector).toHaveBeenCalledTimes(3);
      expect(validResult).toBe(7);
    });

    it('throws the TypeError on every read without suppressErrors', () => {
      // Arrange
      const { store, setCounter } = setup({ suppressErrors: false });
      const { selector } = createNestedValueSelector();

      // Act & Assert
      skipConsoleLogging(() => {
        expect(() => store.selectSnapshot(selector)).toThrow(TypeError);
        expect(() => store.selectSnapshot(selector)).toThrow(TypeError);
      });
      setCounter({ count: 1, nested: { value: 7 } });
      expect(store.selectSnapshot(selector)).toBe(7);
    });
  });

  describe('selectors returning functions', () => {
    it('keeps a parameterised createSelector stable until its slice changes', () => {
      // Arrange
      const { store, setCount, setOther } = setup();
      const plusSelector = createSelector(
        [CounterState],
        (counter: CounterStateModel) => (amount: number) => counter.count + amount
      );
      setCount(5);
      const first = store.selectSnapshot(plusSelector);

      // Act
      setOther('changed');
      const afterUnrelatedChange = store.selectSnapshot(plusSelector);
      setCount(7);
      const afterSliceChange = store.selectSnapshot(plusSelector);

      // Assert
      expect(first(1)).toBe(6);
      expect(afterUnrelatedChange).toBe(first);
      expect(afterSliceChange).not.toBe(first);
      expect(afterSliceChange(1)).toBe(8);
    });

    it('keeps a lazy @Selector correct across state changes', () => {
      // Arrange
      const { store, setCount } = setup();
      setCount(2);
      const first = store.selectSnapshot(CounterQueries.plus);

      // Act
      setCount(3);
      const second = store.selectSnapshot(CounterQueries.plus);

      // Assert
      expect(first(10)).toBe(12);
      expect(second(10)).toBe(13);
    });
  });

  describe('selector helpers', () => {
    it('createPropertySelectors follows the selected property', () => {
      // Arrange
      const { store, setCount, setOther } = setup();
      const counterProps = createPropertySelectors<CounterStateModel>(CounterState);

      // Act
      setCount(4);
      const afterSliceChange = store.selectSnapshot(counterProps.count);
      setOther('changed');
      const afterUnrelatedChange = store.selectSnapshot(counterProps.count);

      // Assert
      expect(afterSliceChange).toBe(4);
      expect(afterUnrelatedChange).toBe(4);
    });

    it('createPickSelector keeps its reference until a picked value changes', () => {
      // Arrange
      const { store, setCount, setOther } = setup();
      const pickSelector = createPickSelector<CounterStateModel, ['count']>(
        CounterState as any,
        ['count']
      );
      const first = store.selectSnapshot(pickSelector);

      // Act
      setOther('changed');
      const afterUnrelatedChange = store.selectSnapshot(pickSelector);
      setCount(9);
      const afterSliceChange = store.selectSnapshot(pickSelector);

      // Assert
      expect(first).toEqual({ count: 0 });
      expect(afterUnrelatedChange).toBe(first);
      expect(afterSliceChange).toEqual({ count: 9 });
    });

    it('createModelSelector combines values from several states', () => {
      // Arrange
      const { store, setCount, setOther } = setup();
      const counterProps = createPropertySelectors<CounterStateModel>(CounterState);
      const modelSelector = createModelSelector({
        count: counterProps.count,
        other: OtherState as unknown as (state: any) => string
      });

      // Act
      setCount(3);
      setOther('changed');

      // Assert
      expect(store.selectSnapshot(modelSelector)).toEqual({ count: 3, other: 'changed' });
    });
  });

  describe('several stores', () => {
    async function createStoreApp() {
      const app = await createApplication({ providers: [provideStore([CounterState])] });
      const store = app.injector.get(Store);
      return { app, store, ...createStateSetters(store) };
    }

    it(
      'gives each store its own results when reads alternate between them',
      freshPlatform(async () => {
        // Arrange
        const first = await createStoreApp();
        const second = await createStoreApp();
        const { summary } = createDiamondGraph();

        // Act & Assert
        for (let step = 1; step <= 5; step++) {
          first.setCount(step);
          second.setCount(step * 100);
          expect(first.store.selectSnapshot(summary)).toEqual({
            d: step * 2,
            t: step * 3,
            l: `count: ${step}`
          });
          expect(second.store.selectSnapshot(summary).d).toBe(step * 200);
          expect(first.store.selectSnapshot(summary).d).toBe(step * 2);
        }
        first.app.destroy();
        second.app.destroy();
      })
    );
  });
});
