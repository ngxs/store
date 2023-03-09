import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NgxsModule,
  State,
  Store,
  createModelSelector,
  createSelector,
  createPropertySelectors,
} from '../../src/public_api';

describe('createModelSelector', () => {
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
    it('should fail if a null selector map is provided', () => {
      // Arrange
      let error: Error | null = null;
      // Act
      try {
        createModelSelector(null as unknown as any);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"Cannot convert undefined or null to object"`
      );
    });

    it('should fail if a undefined selector map is provided', () => {
      // Arrange
      let error: Error | null = null;
      // Act
      try {
        createModelSelector(undefined as unknown as any);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"Cannot convert undefined or null to object"`
      );
    });

    it('should fail if a non-object is provided for the selector map', () => {
      // Arrange
      let error: Error | null = null;
      // Act
      try {
        createModelSelector('not a map' as unknown as any);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createModelSelector]: A valid selector map must be provided."`
      );
    });

    it('should fail if an empty selector map is provided', () => {
      // Arrange
      let error: Error | null = null;
      // Act
      try {
        createModelSelector({});
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createModelSelector]: A non-empty selector map must be provided."`
      );
    });

    it('should fail if a null selector is provided in the selector map', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      // Act
      try {
        createModelSelector({
          prop: null as unknown as typeof stateSelector,
          everything: stateSelector,
        });
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createModelSelector]: A selector for the 'prop' property must be provided."`
      );
    });

    it('should fail if an undefined selector is provided in the selector map', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      // Act
      try {
        createModelSelector({
          everything: stateSelector,
          test: undefined as unknown as typeof stateSelector,
        });
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createModelSelector]: A selector for the 'test' property must be provided."`
      );
    });

    it('should fail if a class that is not a selector is provided in the selector map', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      class NotAState {}
      // Act
      try {
        createModelSelector({
          everything: stateSelector,
          test: NotAState as unknown as typeof stateSelector,
        });
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createModelSelector]: The value provided as the selector for the 'test' property is not a valid selector."`
      );
    });

    it('should fail if a class that is not a selector is provided in the selector map', () => {
      // Arrange
      const { stateSelector } = setupFixture();
      let error: Error | null = null;
      function NotASelector() {}
      // Act
      try {
        createModelSelector({
          everything: stateSelector,
          test: NotASelector as unknown as typeof stateSelector,
        });
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createModelSelector]: The value provided as the selector for the 'test' property is not a valid selector."`
      );
    });
  });

  it('should create a model from the selectors in the selector map', () => {
    // Arrange
    const { store, stateSelector, setState } = setupFixture();
    setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
    const props = createPropertySelectors(stateSelector);
    const prop3 = createPropertySelectors(props.property3);
    // Act
    const modelSelector = createModelSelector({
      foo: props.property2,
      bar: props.property1,
      hello: prop3.hello,
    });
    // Assert
    expect(modelSelector).toBeDefined();
    expect(store.selectSnapshot(modelSelector)).toStrictEqual({
      foo: [1, 3, 5],
      bar: 'Tada',
      hello: 'there',
    });
  });

  describe('[memoization]', () => {
    it('should change if a specified property changes', () => {
      // Arrange
      const { store, stateSelector, setState, patchState } = setupFixture();
      setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
      const props = createPropertySelectors(stateSelector);
      const prop3 = createPropertySelectors(props.property3);
      // Act
      const modelSelector = createModelSelector({
        foo: props.property2,
        bar: props.property1,
        hello: prop3.hello,
      });
      // Assert
      expect(modelSelector).toBeDefined();
      const snapshot1 = store.selectSnapshot(modelSelector);
      expect(snapshot1).toStrictEqual({ foo: [1, 3, 5], bar: 'Tada', hello: 'there' });
      patchState({ property1: 'Hi' });
      const snapshot2 = store.selectSnapshot(modelSelector);
      expect(snapshot2).not.toBe(snapshot1);
      expect(snapshot2).toStrictEqual({ foo: [1, 3, 5], bar: 'Hi', hello: 'there' });
      patchState({ property2: [2, 4] });
      const snapshot3 = store.selectSnapshot(modelSelector);
      expect(snapshot3).not.toBe(snapshot1);
      expect(snapshot3).not.toBe(snapshot2);
      expect(snapshot3).toStrictEqual({ foo: [2, 4], bar: 'Hi', hello: 'there' });
    });

    it('should not change if an unspecified property changes', () => {
      // Arrange
      const { store, stateSelector, setState, patchState } = setupFixture();
      setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
      const props = createPropertySelectors(stateSelector);
      const prop3 = createPropertySelectors(props.property3);
      // Act
      const modelSelector = createModelSelector({
        bar: props.property1,
        hello: prop3.hello,
      });
      // Assert
      expect(modelSelector).toBeDefined();
      const snapshot1 = store.selectSnapshot(modelSelector);
      expect(snapshot1).toStrictEqual({ bar: 'Tada', hello: 'there' });
      patchState({ property2: [2, 4] });
      const snapshot2 = store.selectSnapshot(modelSelector);
      expect(snapshot2).toBe(snapshot1);
      expect(snapshot1).toStrictEqual({ bar: 'Tada', hello: 'there' });
    });
  });
});
