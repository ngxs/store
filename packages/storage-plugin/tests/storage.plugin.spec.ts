import { TestBed } from '@angular/core/testing';

import { NgxsModule, State, Store, Action } from '@ngxs/store';

import { NgxsStoragePluginModule, StorageOption, StorageEngine, STORAGE_ENGINE } from '../';

describe('NgxsStoragePlugin', () => {
  class Increment {
    static type = 'INCREMENT';
  }

  class Decrement {
    static type = 'DECREMENT';
  }

  interface StateModel {
    count: number;
  }

  @State<StateModel>({
    name: 'counter',
    defaults: { count: 0 }
  })
  class MyStore {
    @Action(Increment)
    increment({ getState, setState }) {
      setState({
        count: Number(getState().count) + 1
      });
    }

    @Action(Decrement)
    decrement({ getState, setState }) {
      setState({
        count: Number(getState().count) - 1
      });
    }
  }

  @State<StateModel>({
    name: 'lazyLoaded',
    defaults: { count: 0 }
  })
  class LazyLoadedStore {}

  afterEach(() => {
    localStorage.removeItem('@@STATE');
    sessionStorage.removeItem('@@STATE');
  });

  it('should get initial data from localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyStore]), NgxsStoragePluginModule.forRoot()]
    });

    const store = TestBed.get(Store);

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(100);
    });
  });

  it('should save data to localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyStore]), NgxsStoragePluginModule.forRoot()]
    });

    const store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(105);

      expect(localStorage.getItem('@@STATE')).toBe(JSON.stringify({ counter: { count: 105 } }));
    });
  });

  it('should migrate global localstorage', () => {
    const data = JSON.stringify({ counter: { count: 100, version: 1 } });
    localStorage.setItem('@@STATE', data);

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot({
          migrations: [
            {
              version: 1,
              versionKey: 'counter.version',
              migrate: state => {
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

    const store = TestBed.get(Store);

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(localStorage.getItem('@@STATE')).toBe(JSON.stringify({ counter: { counts: 100, version: 2 } }));
    });
  });

  it('should migrate single localstorage', () => {
    const data = JSON.stringify({ count: 100, version: 1 });
    localStorage.setItem('counter', data);

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot({
          key: 'counter',
          migrations: [
            {
              version: 1,
              key: 'counter',
              versionKey: 'version',
              migrate: state => {
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

    const store = TestBed.get(Store);

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(localStorage.getItem('counter')).toBe(JSON.stringify({ counts: 100, version: 2 }));
    });
  });

  it('should correct get data from session storage', () => {
    sessionStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot({
          storage: StorageOption.SessionStorage
        })
      ]
    });

    const store = TestBed.get(Store);

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(100);
    });
  });

  it('should save data to sessionStorage', () => {
    sessionStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot({
          storage: StorageOption.SessionStorage
        })
      ]
    });

    const store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(105);

      expect(sessionStorage.getItem('@@STATE')).toBe(JSON.stringify({ counter: { count: 105 } }));
    });
  });

  it('should use a custom storage engine', () => {
    class CustomStorage implements StorageEngine {
      static Storage: any = {
        '@@STATE': {
          counter: {
            count: 100
          }
        }
      };

      get length() {
        return Object.keys(CustomStorage.Storage).length;
      }

      getItem(key) {
        return CustomStorage.Storage[key];
      }

      setItem(key, val) {
        CustomStorage.Storage[key] = val;
      }

      removeItem(key) {
        delete CustomStorage.Storage[key];
      }

      clear() {
        CustomStorage.Storage = {};
      }

      key(index) {
        return Object.keys(CustomStorage.Storage)[index];
      }
    }

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
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

    const store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(105);

      expect(CustomStorage.Storage['@@STATE']).toEqual({ counter: { count: 105 } });
    });
  });

  it('should merge unloaded data from feature with local storage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot(),
        NgxsModule.forFeature([LazyLoadedStore])
      ]
    });

    const store = TestBed.get(Store);

    store.select(state => state).subscribe((state: { counter: StateModel; lazyLoaded: StateModel }) => {
      expect(state.lazyLoaded).toBeDefined();
    });
  });

  it('should work with JSON stringify and parse passed as ref to function', () => {
    localStorage.setItem('counter', JSON.stringify({ count: 2137 }));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot({
          key: 'counter',
          serialize: JSON.stringify,
          deserialize: JSON.parse
        })
      ]
    });

    const store = TestBed.get(Store);

    store.dispatch(new Increment());

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(2138);
      expect(localStorage.getItem('counter')).toBe(JSON.stringify({ count: 2138 }));
    });
  });

  it('should merge deserialized data with inital value', () => {
    localStorage.setItem('@@STATE', JSON.stringify({}));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot({
          deserialize: (val, key, state) => ({ ...state, ...JSON.parse(val) })
        })
      ]
    });

    const store = TestBed.get(Store);

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(0);
    });
  });

  it('should use different strategies based on key', () => {
    localStorage.setItem('counter', btoa(JSON.stringify({ count: 2137 })));

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyStore]),
        NgxsStoragePluginModule.forRoot({
          key: 'counter',
          serialize: (val, key) => {
            switch (key) {
              case 'counter':
                return btoa(JSON.stringify(val));
              default:
                return JSON.stringify(val);
            }
          },
          deserialize: (val, key, state) => {
            switch (key) {
              case 'counter':
                return JSON.parse(atob(val));
              default:
                return JSON.parse(val);
            }
          }
        })
      ]
    });

    const store = TestBed.get(Store);
    store.dispatch(new Increment());

    store.select(state => state.counter).subscribe((state: StateModel) => {
      expect(state.count).toBe(2138);
      expect(localStorage.getItem('counter')).toBe(btoa(JSON.stringify({ count: 2138 })));
    });
  });
});
