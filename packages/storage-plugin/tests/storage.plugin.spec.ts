import { TestBed } from '@angular/core/testing';

import { NgxsModule, State, Store, Action, StateContext } from '@ngxs/store';

import { DEFAULT_STATE_KEY } from '../src/internals';
import { NgxsStoragePluginModule, StorageOption, StorageEngine, STORAGE_ENGINE } from '../';

describe('NgxsStoragePlugin', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  class Decrement {
    static type = 'DECREMENT';
  }

  interface CounterStateModel {
    count: number;
  }

  @State<CounterStateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  class CounterState {
    @Action(Increment)
    increment({ getState, setState }: StateContext<CounterStateModel>) {
      setState({
        count: getState().count + 1
      });
    }

    @Action(Decrement)
    decrement({ getState, setState }: StateContext<CounterStateModel>) {
      setState({
        count: getState().count - 1
      });
    }
  }

  @State<CounterStateModel>({
    name: 'lazyLoaded',
    defaults: { count: 0 }
  })
  class LazyLoadedState {}

  afterEach(() => {
    localStorage.removeItem(DEFAULT_STATE_KEY);
    sessionStorage.removeItem(DEFAULT_STATE_KEY);
  });

  it('should get initial data from localstorage', () => {
    // Arrange
    localStorage.setItem(DEFAULT_STATE_KEY, JSON.stringify({ counter: { count: 100 } }));

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsStoragePluginModule.forRoot()]
    });

    const store: Store = TestBed.get(Store);
    const state: CounterStateModel = store.selectSnapshot(CounterState);

    // Assert
    expect(state.count).toBe(100);
  });

  it('should save data to localstorage', () => {
    // Arrange
    localStorage.setItem(DEFAULT_STATE_KEY, JSON.stringify({ counter: { count: 100 } }));

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState]), NgxsStoragePluginModule.forRoot()]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    const state: CounterStateModel = store.selectSnapshot(CounterState);

    // Assert
    expect(state.count).toBe(105);
    expect(localStorage.getItem(DEFAULT_STATE_KEY)).toBe(
      JSON.stringify({ counter: { count: 105 } })
    );
  });

  describe('when blank values are returned from localstorage', () => {
    it('should use default data if null retrieved from localstorage', () => {
      // Arrange
      localStorage.setItem(DEFAULT_STATE_KEY, <any>null);

      @State<CounterStateModel>({
        name: 'counter',
        defaults: {
          count: 123
        }
      })
      class TestState {}

      // Act
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestState]), NgxsStoragePluginModule.forRoot()]
      });

      const store: Store = TestBed.get(Store);
      const state: CounterStateModel = store.selectSnapshot(TestState);

      // Assert
      expect(state.count).toBe(123);
    });

    it('should use default data if undefined retrieved from localstorage', () => {
      // Arrange
      localStorage.setItem(DEFAULT_STATE_KEY, <any>undefined);

      @State<CounterStateModel>({
        name: 'counter',
        defaults: {
          count: 123
        }
      })
      class TestState {}

      // Act
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestState]), NgxsStoragePluginModule.forRoot()]
      });

      const store: Store = TestBed.get(Store);
      const state: CounterStateModel = store.selectSnapshot(TestState);

      // Assert
      expect(state.count).toBe(123);
    });

    it(`should use default data if the string 'undefined' retrieved from localstorage`, () => {
      // Arrange
      localStorage.setItem(DEFAULT_STATE_KEY, 'undefined');

      @State<CounterStateModel>({
        name: 'counter',
        defaults: {
          count: 123
        }
      })
      class TestState {}

      // Act
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestState]), NgxsStoragePluginModule.forRoot()]
      });

      const store: Store = TestBed.get(Store);
      const state: CounterStateModel = store.selectSnapshot(TestState);

      // Assert
      expect(state.count).toBe(123);
    });
  });

  it('should migrate global localstorage', () => {
    // Arrange
    const data = JSON.stringify({ counter: { count: 100, version: 1 } });
    localStorage.setItem(DEFAULT_STATE_KEY, data);

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot({
          migrations: [
            {
              version: 1,
              versionKey: 'counter.version',
              migrate: (state: any) => {
                state.counter = {
                  counts: state.counter.count,
                  version: 2
                };
                return state;
              }
            }
          ]
        })
      ]
    });

    const store: Store = TestBed.get(Store);
    // Call `selectSnapshot` so the `NgxsStoragePlugin.handle` will be invoked also
    // and will run migations
    store.selectSnapshot(CounterState);

    // Assert
    expect(localStorage.getItem(DEFAULT_STATE_KEY)).toBe(
      JSON.stringify({ counter: { counts: 100, version: 2 } })
    );
  });

  it('should migrate single localstorage', () => {
    // Arrange
    const data = JSON.stringify({ count: 100, version: 1 });
    localStorage.setItem('counter', data);

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot({
          key: 'counter',
          migrations: [
            {
              version: 1,
              key: 'counter',
              versionKey: 'version',
              migrate: (state: any) => {
                state = {
                  counts: state.count,
                  version: 2
                };
                return state;
              }
            }
          ]
        })
      ]
    });

    const store: Store = TestBed.get(Store);
    // Call `selectSnapshot` so the `NgxsStoragePlugin.handle` will be invoked also
    // and will run migations
    store.selectSnapshot(CounterState);

    // Assert
    expect(localStorage.getItem('counter')).toBe(JSON.stringify({ counts: 100, version: 2 }));
  });

  it('should correct get data from session storage', () => {
    // Arrange
    sessionStorage.setItem(DEFAULT_STATE_KEY, JSON.stringify({ counter: { count: 100 } }));

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot({
          storage: StorageOption.SessionStorage
        })
      ]
    });

    const store: Store = TestBed.get(Store);
    const state: CounterStateModel = store.selectSnapshot(CounterState);

    // Assert
    expect(state.count).toBe(100);
  });

  it('should save data to sessionStorage', () => {
    sessionStorage.setItem(DEFAULT_STATE_KEY, JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot({
          storage: StorageOption.SessionStorage
        })
      ]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    const state: CounterStateModel = store.selectSnapshot(CounterState);

    // Assert
    expect(state.count).toBe(105);
    expect(sessionStorage.getItem(DEFAULT_STATE_KEY)).toBe(
      JSON.stringify({ counter: { count: 105 } })
    );
  });

  it('should use a custom storage engine', () => {
    // Arrange
    class CustomStorage implements StorageEngine {
      static Storage: any = {
        [DEFAULT_STATE_KEY]: {
          counter: {
            count: 100
          }
        }
      };

      get length() {
        return Object.keys(CustomStorage.Storage).length;
      }

      getItem(key: string) {
        return CustomStorage.Storage[key];
      }

      setItem(key: string, val: any) {
        CustomStorage.Storage[key] = val;
      }

      removeItem(key: string) {
        delete CustomStorage.Storage[key];
      }

      clear() {
        CustomStorage.Storage = {};
      }
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot({
          serialize(val) {
            return val;
          },
          deserialize(val) {
            return val;
          }
        })
      ],
      providers: [
        {
          provide: STORAGE_ENGINE,
          useClass: CustomStorage
        }
      ]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    const state: CounterStateModel = store.selectSnapshot(CounterState);

    // Assert
    expect(state.count).toBe(105);
    expect(CustomStorage.Storage[DEFAULT_STATE_KEY]).toEqual({ counter: { count: 105 } });
  });

  it('should merge unloaded data from feature with local storage', () => {
    // Arrange
    localStorage.setItem(DEFAULT_STATE_KEY, JSON.stringify({ counter: { count: 100 } }));

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState]),
        NgxsStoragePluginModule.forRoot(),
        NgxsModule.forFeature([LazyLoadedState])
      ]
    });

    const store: Store = TestBed.get(Store);
    const state: {
      counter: CounterStateModel;
      lazyLoaded: CounterStateModel;
    } = store.snapshot();

    // Assert
    expect(state.lazyLoaded).toBeDefined();
  });

  describe('State classes as key', () => {
    @State({
      name: 'names',
      defaults: []
    })
    class NamesState {}

    it('should be possible to provide a state class as a key', () => {
      // Arrange
      localStorage.setItem('counter', JSON.stringify({ count: 100 }));

      // Act
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([CounterState]),
          NgxsStoragePluginModule.forRoot({
            key: CounterState
          })
        ]
      });

      const store: Store = TestBed.get(Store);
      const state: CounterStateModel = store.selectSnapshot(CounterState);

      // Assert
      expect(state.count).toBe(100);
    });

    it('should be possible to provide array of state classes', () => {
      // Arrange
      localStorage.setItem('counter', JSON.stringify({ count: 100 }));
      localStorage.setItem('names', JSON.stringify(['Mark', 'Artur', 'Max']));

      // Act
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([CounterState, NamesState]),
          NgxsStoragePluginModule.forRoot({
            key: [CounterState, NamesState]
          })
        ]
      });

      const store: Store = TestBed.get(Store);

      // Assert
      expect(store.snapshot()).toEqual({
        counter: {
          count: 100
        },
        names: ['Mark', 'Artur', 'Max']
      });
    });

    it('should be possible to use both state classes and strings', () => {
      // Arrange
      localStorage.setItem('counter', JSON.stringify({ count: 100 }));
      localStorage.setItem('names', JSON.stringify(['Mark', 'Artur', 'Max']));

      // Act
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([CounterState, NamesState]),
          NgxsStoragePluginModule.forRoot({
            key: [CounterState, 'names']
          })
        ]
      });

      const store: Store = TestBed.get(Store);

      // Assert
      expect(store.snapshot()).toEqual({
        counter: {
          count: 100
        },
        names: ['Mark', 'Artur', 'Max']
      });
    });
  });
});
