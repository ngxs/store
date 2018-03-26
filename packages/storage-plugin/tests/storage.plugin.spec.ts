import { TestBed } from '@angular/core/testing';

import { NgxsModule, State, Store, Action } from '@ngxs/store';

import { NgxsStoragePluginModule, StorageOption, StorageEngine, STORAGE_ENGINE } from '../';

describe('NgxsStoragePlugin', () => {
  class Increment {}

  class Decrement {}

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
});
