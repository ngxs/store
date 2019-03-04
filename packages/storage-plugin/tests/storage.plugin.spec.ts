import { TestBed } from '@angular/core/testing';

import { NgxsModule, State, Store, Action } from '@ngxs/store';

import { NgxsStoragePluginModule, StorageOption, StorageEngine, STORAGE_ENGINE } from '../';
import { StateContext } from '@ngxs/store';

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
    increment({ getState, setState }: StateContext<StateModel>) {
      setState({
        count: Number(getState().count) + 1
      });
    }

    @Action(Decrement)
    decrement({ getState, setState }: StateContext<StateModel>) {
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

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(state.count).toBe(100);
      });
  });

  it('should save data to localstorage', () => {
    localStorage.setItem('@@STATE', JSON.stringify({ counter: { count: 100 } }));

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyStore]), NgxsStoragePluginModule.forRoot()]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(state.count).toBe(105);

        expect(localStorage.getItem('@@STATE')).toBe(
          JSON.stringify({ counter: { count: 105 } })
        );
      });
  });

  describe('when blank values are returned from localstorage', () => {
    it('should use default data if null retrieved from localstorage', () => {
      localStorage.setItem('@@STATE', <any>null);

      @State<StateModel>({ name: 'counter', defaults: { count: 123 } })
      class TestStore {}

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestStore]), NgxsStoragePluginModule.forRoot()]
      });

      const store = TestBed.get(Store);

      store
        .select((state: any) => state.counter)
        .subscribe((state: StateModel) => {
          expect(state.count).toBe(123);
        });
    });

    it('should use default data if undefined retrieved from localstorage', () => {
      localStorage.setItem('@@STATE', <any>undefined);

      @State<StateModel>({ name: 'counter', defaults: { count: 123 } })
      class TestStore {}

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestStore]), NgxsStoragePluginModule.forRoot()]
      });

      const store = TestBed.get(Store);

      store
        .select((state: any) => state.counter)
        .subscribe((state: StateModel) => {
          expect(state.count).toBe(123);
        });
    });

    it(`should use default data if the string 'undefined' retrieved from localstorage`, () => {
      localStorage.setItem('@@STATE', 'undefined');

      @State<StateModel>({ name: 'counter', defaults: { count: 123 } })
      class TestStore {}

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestStore]), NgxsStoragePluginModule.forRoot()]
      });

      const store = TestBed.get(Store);

      store
        .select((state: any) => state.counter)
        .subscribe((state: StateModel) => {
          expect(state.count).toBe(123);
        });
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

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(localStorage.getItem('@@STATE')).toBe(
          JSON.stringify({ counter: { counts: 100, version: 2 } })
        );
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

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(localStorage.getItem('counter')).toBe(
          JSON.stringify({ counts: 100, version: 2 })
        );
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

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
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

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
        expect(state.count).toBe(105);

        expect(sessionStorage.getItem('@@STATE')).toBe(
          JSON.stringify({ counter: { count: 105 } })
        );
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

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());

    store
      .select((state: any) => state.counter)
      .subscribe((state: StateModel) => {
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

    const store: Store = TestBed.get(Store);

    store
      .select((state: any) => state)
      .subscribe((state: { counter: StateModel; lazyLoaded: StateModel }) => {
        expect(state.lazyLoaded).toBeDefined();
      });
  });
});
