import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';

import { NgxsModule, State, Store, Action, StateContext } from '@ngxs/store';
import { NgxsStoragePluginModule, StorageOption } from '..';

describe('NgxsStoragePlugin-StorageFallback', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  interface CounterStateModel {
    count: number;
  }

  @State<CounterStateModel>({
    name: 'counter',
    defaults: { count: 1 }
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
    disableStorage('localStorage');
    disableStorage('sessionStorage');
  });

  it('make sure we keep the default state value when localStorage is not available', () => {
    const storage = window.localStorage;
    try {
      // Arrange
      // disableStorage('localStorage');
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
      const state: CounterStateModel = store.selectSnapshot(CounterState);

      // Assert
      expect(state.count).toBe(1);
    } finally {
      restoreStorage('localStorage', storage);
    }
  });

  it('storage engine should work when localStorage is not available', () => {
    const storage = window.localStorage;
    try {
      // Arrange
      disableStorage('localStorage');
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
      expect(state.count).toBe(3);
    } finally {
      restoreStorage('localStorage', storage);
    }
  });

  it('storage engine should work when sessionStorage is not available', () => {
    const storage = window.sessionStorage;
    try {
      // Arrange
      disableStorage('sessionStorage');
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([CounterState]),
          NgxsStoragePluginModule.forRoot({
            key: CounterState,
            storage: StorageOption.SessionStorage
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
      expect(state.count).toBe(4);
    } finally {
      restoreStorage('sessionStorage', storage);
    }
  });
});

function disableStorage(key: 'localStorage' | 'sessionStorage') {
  Object.defineProperty(window, key, {
    value: () => {
      throw new Error(`${key} is not available`);
    },
    writable: true
  });
}

function restoreStorage(key: 'localStorage' | 'sessionStorage', storage: Storage) {
  Object.defineProperty(window, key, {
    value: () => storage,
    writable: true
  });
}
