import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Store, createPropertySelectors } from '@ngxs/store';

describe('createPropertySelectors', () => {
  interface MyStateModel {
    property1: string;
    property2: number[];
    emptyProperty: {
      loading?: boolean;
    };
  }

  @State<MyStateModel>({
    name: 'myState',
    defaults: {
      property1: 'testValue',
      property2: [1, 2, 3],
      emptyProperty: {}
    }
  })
  @Injectable()
  class MyState {}

  function setupFixture() {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });
    const store: Store = TestBed.inject(Store);
    const setState = (newState: MyStateModel) => store.reset({ myState: newState });
    return { store, MyState, setState };
  }

  describe('[failures]', () => {
    it('should fail if a null selector is provided', () => {
      // Arrange
      let error: Error | null = null;
      // Act
      try {
        createPropertySelectors(null as any);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPropertySelectors]: A parent selector must be provided."`
      );
    });

    it('should fail if a undefined selector is provided', () => {
      // Arrange
      let error: Error | null = null;
      // Act
      try {
        createPropertySelectors(undefined as any);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPropertySelectors]: A parent selector must be provided."`
      );
    });

    it('should fail if a class that is not a selector is provided', () => {
      // Arrange
      let error: Error | null = null;
      // Act
      try {
        class NotAState {}
        createPropertySelectors(NotAState);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPropertySelectors]: The value provided as the parent selector is not a valid selector."`
      );
    });

    it('should fail if a function that is not a selector is provided', () => {
      // Arrange
      let error: Error | null = null;
      function NotASelector() {}
      // Act
      try {
        createPropertySelectors(NotASelector);
      } catch (err) {
        error = err as Error;
      }
      // Assert
      expect(error).not.toBeNull();
      expect(error?.message).toMatchInlineSnapshot(
        `"[createPropertySelectors]: The value provided as the parent selector is not a valid selector."`
      );
    });
  });

  it('should create a selector for each property of state', () => {
    // Arrange
    // Act
    const slices = createPropertySelectors<MyStateModel>(MyState);
    // Assert
    expect(slices).toHaveProperty('property1');
    expect(slices).toHaveProperty('property2');
    expect(slices).toHaveProperty('emptyProperty');
  });

  it('should return selectors returning the correct value of the state', () => {
    // Arrange
    const exampleState: MyStateModel = {
      property1: 'foo',
      property2: [5, 4, 3],
      emptyProperty: {
        loading: true
      }
    };
    // Act
    const slices = createPropertySelectors<MyStateModel>(MyState);
    // Assert

    expect(slices.property1(exampleState)).toBe('foo');
    expect(slices.property2(exampleState)).toStrictEqual([5, 4, 3]);
  });

  it('should handle missing properties in the state as undefined', () => {
    // Arrange
    const { store, MyState, setState } = setupFixture();

    const slices = createPropertySelectors<MyStateModel>(MyState);

    // Act
    const slicesOnEmptyProperty = createPropertySelectors<MyStateModel['emptyProperty']>(
      slices.emptyProperty
    );

    // Assert
    expect(store.selectSnapshot(slices.emptyProperty)).toEqual({});
    expect(store.selectSnapshot(slicesOnEmptyProperty.loading)).toBe(undefined);

    setState({
      property1: 'testValue',
      property2: [1, 2, 3],
      emptyProperty: {
        loading: true
      }
    });

    expect(store.selectSnapshot(slicesOnEmptyProperty.loading)).toBe(true);
  });

  it('should memoise each internal selector', () => {
    // Arrange
    const { store, MyState } = setupFixture();
    const myState = store.selectSnapshot<MyStateModel>(MyState);
    // Act
    const slices1 = createPropertySelectors<MyStateModel>(MyState);
    const slices2 = createPropertySelectors<MyStateModel>(MyState);
    // Assert
    expect(slices1.property1(myState) === slices2.property1(myState)).toBeTruthy();
    expect(slices1.property2(myState) === slices2.property2(myState)).toBeTruthy();
    expect(slices1.emptyProperty(myState) === slices2.emptyProperty(myState)).toBeTruthy();
  });

  it('should return the same selectors from slice object on each call', () => {
    // Arrange
    // Act
    const slice = createPropertySelectors<MyStateModel>(MyState);
    // Assert
    expect(slice.property1).toBe(slice.property1);
    expect(slice.property2).toBe(slice.property2);
    expect(slice.emptyProperty).toBe(slice.emptyProperty);
  });

  it('should return a different slices object on each call', () => {
    // Arrange
    // Act
    const slices1 = createPropertySelectors<MyStateModel>(MyState);
    const slices2 = createPropertySelectors<MyStateModel>(MyState);
    // Assert
    expect(slices1).not.toBe(slices2);
    expect(slices1.property1).not.toBe(slices2.property1);
    expect(slices1.property2).not.toBe(slices2.property2);
    expect(slices1.emptyProperty).not.toBe(slices2.emptyProperty);
  });
});
