import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NgxsModule,
  State,
  Store,
  createPickSelector,
  createSelector,
} from '../../src/public_api';

describe('createPickSelector', () => {
  interface MockStateModel {
    property1: string;
    property2: number[];
    property3: { hello: string };
  }

  @State<MockStateModel>({
    name: 'mockstate',
    defaults: {
      property1: '',
      property2: [],
      property3: { hello: 'world' },
    },
  })
  @Injectable()
  class MockState {}

  function setupFixture() {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MockState])],
    });
    const store: Store = TestBed.inject(Store);
    const setState = (newState: MockStateModel) => store.reset({ mockstate: newState });
    const patchState = (newState: Partial<MockStateModel>) => {
      const currentState = store.selectSnapshot(MockState);
      setState({ ...currentState, ...newState });
    };
    const stateSelector = createSelector([MockState], (state: MockStateModel) => state);
    return { store, MockState, setState, patchState, stateSelector };
  }

  describe('[failures]', () => {
    it('should fail if a null selector is provided', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      // Act
      try {
        createPickSelector(null as unknown as typeof stateSelector, ['property1']);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPickSelector]: A selector must be provided."`
      );
    });

    it('should fail if a undefined selector is provided', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      // Act
      try {
        createPickSelector(undefined as unknown as typeof stateSelector, ['property1']);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPickSelector]: A selector must be provided."`
      );
    });

    it('should fail if a class that is not a selector is provided', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      class NotAState {}
      // Act
      try {
        createPickSelector(NotAState as unknown as typeof stateSelector, ['property1']);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPickSelector]: The value provided as the selector is not a valid selector."`
      );
    });

    it('should fail if a function that is not a selector is provided', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      function NotASelector() {}
      // Act
      try {
        createPickSelector(NotASelector as unknown as typeof stateSelector, ['property1']);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPickSelector]: The value provided as the selector is not a valid selector."`
      );
    });
  });

  it('should select only the specified properties', () => {
    // Arrange
    const { store, stateSelector, setState } = setupFixture();
    setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
    // Act
    const pickSelector = createPickSelector(stateSelector, ['property1', 'property2']);
    // Assert
    expect(pickSelector).toBeDefined();
    expect(store.selectSnapshot(pickSelector)).toStrictEqual({
      property1: 'Tada',
      property2: [1, 3, 5],
    });
  });

  it('should ignore an undefined key in the specified properties', () => {
    // Arrange
    const { store, stateSelector, setState } = setupFixture();
    setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
    // Act
    const pickSelector = createPickSelector(stateSelector, [
      'property1',
      undefined as any,
      'property2',
    ]);
    // Assert
    expect(pickSelector).toBeDefined();
    expect(store.selectSnapshot(pickSelector)).toStrictEqual({
      property1: 'Tada',
      property2: [1, 3, 5],
    });
  });

  it('should ignore a null key in the specified properties', () => {
    // Arrange
    const { store, stateSelector, setState } = setupFixture();
    setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
    // Act
    const pickSelector = createPickSelector(stateSelector, [
      'property1',
      null as any,
      'property2',
    ]);
    // Assert
    expect(pickSelector).toBeDefined();
    expect(store.selectSnapshot(pickSelector)).toStrictEqual({
      property1: 'Tada',
      property2: [1, 3, 5],
    });
  });

  describe('[memoization]', () => {
    it('should change if a specified property changes', () => {
      // Arrange
      const { store, stateSelector, setState, patchState } = setupFixture();
      setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
      // Act
      const pickSelector = createPickSelector(stateSelector, ['property1', 'property2']);
      // Assert
      expect(pickSelector).toBeDefined();
      const snapshot1 = store.selectSnapshot(pickSelector);
      expect(snapshot1).toStrictEqual({ property1: 'Tada', property2: [1, 3, 5] });
      patchState({ property1: 'Hi' });
      const snapshot2 = store.selectSnapshot(pickSelector);
      expect(snapshot2).not.toBe(snapshot1);
      expect(snapshot2).toStrictEqual({ property1: 'Hi', property2: [1, 3, 5] });
      patchState({ property2: [2, 4] });
      const snapshot3 = store.selectSnapshot(pickSelector);
      expect(snapshot3).not.toBe(snapshot1);
      expect(snapshot3).not.toBe(snapshot2);
      expect(snapshot3).toStrictEqual({ property1: 'Hi', property2: [2, 4] });
    });

    it('should not change if an unspecified property changes', () => {
      // Arrange
      const { store, stateSelector, setState, patchState } = setupFixture();
      setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
      // Act
      const pickSelector = createPickSelector(stateSelector, ['property1', 'property2']);
      // Assert
      expect(pickSelector).toBeDefined();
      const snapshot1 = store.selectSnapshot(pickSelector);
      expect(snapshot1).toStrictEqual({ property1: 'Tada', property2: [1, 3, 5] });
      patchState({ property3: { hello: 'you' } });
      const snapshot2 = store.selectSnapshot(pickSelector);
      expect(snapshot2).toBe(snapshot1);
    });
  });
});
