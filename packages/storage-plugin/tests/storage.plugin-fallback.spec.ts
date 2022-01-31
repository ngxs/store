import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';

import { NgxsModule, State, Store, Action, StateContext } from '@ngxs/store';
import { NgxsStoragePluginModule } from '..';

describe('NgxsStoragePlugin-StorageFallback', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  interface CounterStateModel {
    count: number;
  }

  @State<CounterStateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment({ getState, setState }: StateContext<CounterStateModel>) {
      setState({
        count: getState().count + 1
      });
    }
  }

  beforeEach(() => {
    disableLocalStorage();
    disableSessionStorage();
  });

  it('storage engine should work with fallback implementation, when localStorage is not available', () => {
    // Arrange
    disableLocalStorage();
    const spyWarn = jest.spyOn(console, 'warn');
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot({
          key: CounterState
        })
      ]
    });

    // Act
    const store: Store = TestBed.inject(Store);
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    const state: CounterStateModel = store.selectSnapshot(CounterState);

    // Assert
    expect(spyWarn).toHaveBeenCalledTimes(1);
    expect(state.count).toBe(2);
  });

  it('storage engine should work with fallback implementation, when sessionStorage is not available', () => {
    // Arrange
    disableSessionStorage();
    const spyWarn = jest.spyOn(console, 'warn');
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot({
          key: CounterState
        })
      ]
    });

    // Act
    const store: Store = TestBed.inject(Store);
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    const state: CounterStateModel = store.selectSnapshot(CounterState);

    // Assert
    expect(spyWarn).toHaveBeenCalledTimes(1);
    expect(state.count).toBe(3);
  });
});

function disableLocalStorage() {
  Object.defineProperty(window, 'localStorage', {
    value: () => {
      throw new Error('localStorage is not available');
    },
    writable: true
  });
}

function disableSessionStorage() {
  Object.defineProperty(window, 'sessionStorage', {
    value: () => {
      throw new Error('sessionStorage is not available');
    },
    writable: true
  });
}
