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

  // it('Passing null', () => {
  //   const pickSelector = createPickSelector(null, ['property1', 'property2']);

  //   expect(pickSelector).toBe(null)
  // })

  // it('Passing undefined', () => {
  //   const pickSelector = createPickSelector(undefined, ['property1', 'property2']);

  //   expect(pickSelector).toBe(undefined)
  // })

  // it('Passing undefined on keys should ignore', () => {
  //   TestBed.configureTestingModule({
  //     imports: [NgxsModule.forRoot([MockState])],
  //   });

  //   const stateSelector = createSelector([MockState], (state: MockStateModel) => state)

  //   const pickSelector = createPickSelector(stateSelector, [
  //     undefined as any,
  //     'property2',
  //   ]);

  //   expect(pickSelector).toBe(undefined);
  // });

  it('should select only the specified properties', () => {
    // Arrange
    const { store, stateSelector, setState } = setupFixture();
    setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
    // Act
    const pickSelector = createPickSelector(stateSelector, ['property1', 'property2']);
    // Assert
    expect(pickSelector).toBeDefined();
    expect(store.selectSnapshot(pickSelector)).toEqual({
      property1: 'Tada',
      property2: [1, 3, 5],
    });
  });

  it('should change if a specified property changes', () => {
    // Arrange
    const { store, stateSelector, setState, patchState } = setupFixture();
    setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
    // Act
    const pickSelector = createPickSelector(stateSelector, ['property1', 'property2']);
    // Assert
    expect(pickSelector).toBeDefined();
    const snapshot1 = store.selectSnapshot(pickSelector);
    expect(snapshot1).toEqual({ property1: 'Tada', property2: [1, 3, 5] });
    patchState({ property1: 'Hi' });
    const snapshot2 = store.selectSnapshot(pickSelector);
    expect(snapshot2).not.toBe(snapshot1);
    expect(snapshot2).toEqual({ property1: 'Hi', property2: [1, 3, 5] });
    patchState({ property2: [2, 4] });
    const snapshot3 = store.selectSnapshot(pickSelector);
    expect(snapshot3).not.toBe(snapshot1);
    expect(snapshot3).not.toBe(snapshot2);
    expect(snapshot3).toEqual({ property1: 'Hi', property2: [2, 4] });
  });

  it('should not change if a unspecified property changes', () => {
    // Arrange
    const { store, stateSelector, setState, patchState } = setupFixture();
    setState({ property1: 'Tada', property2: [1, 3, 5], property3: { hello: 'there' } });
    // Act
    const pickSelector = createPickSelector(stateSelector, ['property1', 'property2']);
    // Assert
    expect(pickSelector).toBeDefined();
    const snapshot1 = store.selectSnapshot(pickSelector);
    expect(snapshot1).toEqual({ property1: 'Tada', property2: [1, 3, 5] });
    patchState({ property3: { hello: 'you' } });
    const snapshot2 = store.selectSnapshot(pickSelector);
    expect(snapshot2).toBe(snapshot1);
  });
});
